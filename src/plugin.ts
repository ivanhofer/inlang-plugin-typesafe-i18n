import type { InlangConfig } from "@inlang/core/config";
import type { InlangEnvironment } from "@inlang/core/environment";
import type * as ast from "@inlang/core/ast";
import { getConfig, getLocaleInformation } from "typesafe-i18n/config";
import { createPlugin } from "@inlang/core/plugin";

export const plugin = createPlugin(({ env }) => ({
  id: "ivanhofer.inlang-plugin-typesafe-i18n",
  async config() {
    // @ts-expect-error - the types slightly differ should work regardless
    const { base, locales } = await getLocaleInformation(env.$fs);

    return {
      referenceLanguage: base,
      languages: locales,
      readResources: ({ config }) => {
        return readResources({ config, ...env });
      },
      writeResources: ({ config, resources }) => {
        return writeResources({
          config,
          resources,
          ...env,
        });
      },
    };
  },
}));

// issues:
//  - real typescript compilation does not work

type ReadResourcesArgs = Parameters<InlangConfig["readResources"]>[0] &
  InlangEnvironment;

// TODO: this should come from an util package
const resolve = (...parts: string[]): string =>
  parts
    .map((p) => {
      while (p.startsWith("/")) {
        p = p.substring(1);
      }
      while (p.endsWith("/")) {
        p = p.substring(0, p.length - 1);
      }
      return p;
    })
    .join("/");

export async function readResources({
  config,
  $fs,
}: ReadResourcesArgs): ReturnType<InlangConfig["readResources"]> {
  // @ts-expect-error - the types slightly differ should work regardless
  const typesafeI18nConfig = await getConfig($fs);

  const result: ast.Resource[] = [];
  for (const language of config.languages) {
    const dictionary = await getDictionaryForLocale(
      $fs,
      typesafeI18nConfig.outputPath,
      language
    );
    result.push(parseResource(dictionary, language));
  }

  return result;
}

const getDictionaryForLocale = async (
  $fs: InlangEnvironment["$fs"],
  outputPath: string,
  locale: string
) => {
  // TODO: create a better, less hacky version
  const baseDictionary = (
    await $fs.readFile(resolve(outputPath, `${locale}/index.ts`), {
      encoding: "utf-8",
    })
  ).toString();
  const withoutImports = baseDictionary
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n");
  const withoutTypes = withoutImports.replace(/:.*=/g, " =");
  const withoutSatisfies = withoutTypes.replace(/ satisfies.*\/n/g, "\n");

  const moduleWithMimeType =
    "data:application/javascript," + encodeURIComponent(withoutSatisfies);
  return (await import(/* @vite-ignore */ moduleWithMimeType)).default;
};

const parseResource = (
  flatJson: Record<string, string>,
  locale: string
): ast.Resource => {
  return {
    type: "Resource",
    languageTag: {
      type: "LanguageTag",
      name: locale,
    },
    body: Object.entries(flatJson).map(([id, value]) =>
      parseMessage(id, value)
    ),
  };
};

const parseMessage = (id: string, value: string): ast.Message => {
  // TODO: also parse variables
  return {
    type: "Message",
    id: {
      type: "Identifier",
      name: id,
    },
    pattern: { type: "Pattern", elements: [{ type: "Text", value: value }] },
  };
};

// --------------------------------------------------------------------------------------------------------------------

type WriteResourcesArgs = Parameters<InlangConfig["writeResources"]>[0] &
  InlangEnvironment;

export async function writeResources({
  $fs,
  config,
  resources,
}: WriteResourcesArgs): ReturnType<InlangConfig["writeResources"]> {
  // @ts-expect-error - the types slightly differ should work regardless
  const typesafeI18nConfig = await getConfig($fs);

  for (const resource of resources) {
    const locale = resource.languageTag.name;
    const dictionary = serializeResource(resource);

    const type =
      locale === config.referenceLanguage ? "BaseTranslation" : "Translation";
    // TODO: path could be wrong if esmImports=true
    // TODO: export utility type from `typesafe-i18n` to get correct string e.g. with `satisfies` syntax
    const template = `import type { ${type} } from '${resolve(
      typesafeI18nConfig.outputPath,
      typesafeI18nConfig.typesFileName
    )}'

const ${locale}: ${type} = ${dictionary}

export default ${locale}`;

    await $fs.writeFile(
      resolve(typesafeI18nConfig.outputPath, `${locale}/index.ts`),
      template
    );
  }
}

const serializeResource = (resource: ast.Resource): string => {
  const json = Object.fromEntries(resource.body.map(serializeMessage));
  // stringify the object with beautification
  return JSON.stringify(json, null, 3);
};

function serializeMessage(message: ast.Message): [id: string, value: string] {
  return [message.id.name, serializePattern(message.pattern)];
}

function serializePattern(pattern: ast.Pattern): string {
  return pattern.elements.map(serializePatternElement).join("");
}

function serializePatternElement(
  element: ast.Pattern["elements"][number]
): string {
  switch (element.type) {
    case "Text":
      return element.value;
    case "Placeholder":
      return `{${element.body.name}}`;
  }
}
