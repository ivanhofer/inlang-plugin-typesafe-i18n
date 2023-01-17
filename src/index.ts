import type { Config, EnvironmentFunctions } from "@inlang/core/config";
import type * as ast from "@inlang/core/ast";
import { getConfig } from 'typesafe-i18n/config'

// issues:
//  - real typescript compilation does not work
//  - $import can't be used to import a base64 encoded string

export type PluginConfig = {};

type ReadResourcesArgs = Parameters<Config["readResources"]>[0] & EnvironmentFunctions & { pluginConfig: PluginConfig }

const resolve = (...parts: string[]): string => parts.map(p => {
  while (p.startsWith('/')) {
    p = p.substring(1)
  }
  while (p.endsWith('/')) {
    p = p.substring(0, p.length - 1)
  }
  return p
}).join('/')

export async function readResources(
  { config, $fs, $import }: ReadResourcesArgs
): ReturnType<Config["readResources"]> {
  const typesafeI18nConfig = await getConfig($fs)

  const result: ast.Resource[] = [];
  for (const language of config.languages) {
    const dictionary = await getDictionaryForLocale($fs, $import, typesafeI18nConfig.outputPath, language)
    result.push(parseResource(dictionary, language));
  }

  return result
}

const getDictionaryForLocale = async ($fs: EnvironmentFunctions['$fs'], $import: EnvironmentFunctions['$import'], outputPath: string, locale: string) => {
  const baseDictionary = (await $fs.readFile(resolve(outputPath, `${locale}/index.ts`), 'utf-8')).toString()
  const withoutImports = baseDictionary.split('\n').filter(line => !line.trim().startsWith('import ')).join('\n')
  const withoutTypes = withoutImports.replace(/:.*=/g, ' =')

  // this does not work
  // const moduleWithMimeType = "data:application/javascript;base64," + Buffer.from(withoutTypes).toString('base64');
  // return (await $import(moduleWithMimeType)).default;

  await $fs.writeFile(`${locale}.temp.js`, withoutTypes)
  const module = (await $import(`${locale}.temp.js`)).default;
  await $fs.rm(`${locale}.temp.js`)
  return module
}

const parseResource = (
  flatJson: Record<string, string>,
  language: string
): ast.Resource => {
  return {
    type: "Resource",
    languageTag: {
      type: "LanguageTag",
      language: language,
    },
    body: Object.entries(flatJson).map(([id, value]) =>
      parseMessage(id, value)
    ),
  };
}

const parseMessage = (id: string, value: string): ast.Message => {
  return {
    type: "Message",
    id: {
      type: "Identifier",
      name: id,
    },
    pattern: { type: "Pattern", elements: [{ type: "Text", value: value }] },
  };
}

// --------------------------------------------------------------------------------------------------------------------

type WriteResourcesArgs = Parameters<Config["writeResources"]>[0] & EnvironmentFunctions & { pluginConfig: PluginConfig }

export async function writeResources(
  { $fs, config, resources }: WriteResourcesArgs
): ReturnType<Config["writeResources"]> {
  const typesafeI18nConfig = await getConfig($fs)

  for (const resource of resources) {
    const locale = resource.languageTag.language
    const dictionary = serializeResource(resource)

    const type = locale === config.referenceLanguage ? 'BaseTranslation' : 'Translation'
    // TODO: path could be wrong if esmImports=true
    const template = `import type { ${type} } from './${resolve(typesafeI18nConfig.outputPath, typesafeI18nConfig.typesFileName)}'

const ${locale}: ${type} = ${dictionary}

export default ${locale}`

    await $fs.writeFile(`${locale}.ts`, template);
  }
}

const serializeResource = (resource: ast.Resource): string => {
  const json = Object.fromEntries(resource.body.map(serializeMessage));
  // stringify the object with beautification
  return JSON.stringify(json, null, 3);
}

function serializeMessage(message: ast.Message): [id: string, value: string] {
  return [message.id.name, message.pattern.elements[0].value];
}
