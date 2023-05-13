import type { InlangConfig } from "@inlang/core/config"
import type { InlangEnvironment } from "@inlang/core/environment"
import type * as ast from "@inlang/core/ast"
import { getConfig, getLocaleInformation } from "typesafe-i18n/config"
import { experimentalParseMessage, type ParameterPart, type PluralPart } from "typesafe-i18n/parser"
import { createPlugin } from "@inlang/core/plugin"
import type { readdir } from "node:fs/promises"

export const plugin = createPlugin(({ env }) => ({
  id: "ivanhofer.inlang-plugin-typesafe-i18n",
  async config() {
    // @ts-expect-error - the types slightly differ; should work regardless
    const { base, locales } = await getLocaleInformation(patchFs(env.$fs))

    return {
      referenceLanguage: base,
      languages: locales,
      readResources: ({ config }) => readResources({ config, ...env }),
      writeResources: ({ config, resources }) => writeResources({ config, resources, ...env }),
    }
  },
}))

// issues:
//  - real typescript compilation does not work

type ReadResourcesArgs = Parameters<InlangConfig["readResources"]>[0] &
  InlangEnvironment

// TODO: this should come from an util package
const resolve = (...parts: string[]): string =>
  parts
    .map((p) => {
      while (p.startsWith("/")) {
        p = p.substring(1)
      }
      while (p.endsWith("/")) {
        p = p.substring(0, p.length - 1)
      }
      return p
    })
    .join("/")

const patchFs = (fs: InlangEnvironment["$fs"]) => {
  return {
    ...fs,
    readdir: async (path: string, options?: Parameters<typeof readdir>[1]) => {
      const result = await fs.readdir(path)
      if (!options?.withFileTypes) return result

      return result.map(name => ({
        name,
        isDirectory: () => !(name.endsWith('.ts') || name.endsWith('.js')),
      }))
    }
  } as unknown as InlangEnvironment["$fs"]
}

async function readResources({
  config,
  $fs: rawFs,
}: ReadResourcesArgs): ReturnType<InlangConfig["readResources"]> {
  const $fs = patchFs(rawFs)

  // @ts-expect-error - the types slightly differ; should work regardless
  const typesafeI18nConfig = await getConfig($fs)

  const result: ast.Resource[] = []
  for (const language of config.languages) {
    const dictionary = await getDictionaryForLocale(
      $fs,
      typesafeI18nConfig.outputPath,
      language
    )
    result.push(parseResource(dictionary, language))
  }

  return result
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
  ).toString()
  const withoutImports = baseDictionary
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n")
  const withoutTypes = withoutImports.replace(/:.*=/g, " =")
  const withoutSatisfies = withoutTypes.replace(/ satisfies.*\/n/g, "\n")

  const moduleWithMimeType =
    "data:application/javascript," + encodeURIComponent(withoutSatisfies)
  return (await import(/* @vite-ignore */ moduleWithMimeType)).default
}

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
    ).flat(),
  }
}

const parseMessage = (id: string, value: string | Record<string, string>): ast.Message | ast.Message[] => {
  if (typeof value === 'object')
    return Object.entries(value).map(([entryId, entryValue]) =>
      parseMessage(`${id}.${entryId}`, entryValue)
    ).flat()

  const parsedMessage = experimentalParseMessage(value)

  return {
    type: "Message",
    id: {
      type: "Identifier",
      name: id,
    },
    pattern: {
      type: "Pattern",
      elements: parsedMessage.map(part => {
        switch (part.kind) {
          case 'parameter':
            return parseParameter(part)
          case 'text':
            return { type: "Text", value: part.content }
          case 'plural':
            return parsePlural(part)
        }
      })
    },
  }
}

const parseParameter = (parameterPart: ParameterPart): ast.Placeholder => {
  return {
    type: "Placeholder",
    body: {
      type: 'VariableReference',
      name: parameterPart.key,
      metadata: {
        types: parameterPart.types,
        optional: parameterPart.optional,
        transforms: parameterPart.transforms,
      }
    }
  }
}

const parsePlural = (pluralPart: PluralPart): ast.Text => {
  return {
    type: "Text",
    value: `{{${[pluralPart.zero, pluralPart.one, pluralPart.two, pluralPart.few, pluralPart.many, pluralPart.other]
      .filter(Boolean)
      .join('|')
      }}}`
  }
}

// --------------------------------------------------------------------------------------------------------------------

type WriteResourcesArgs = Parameters<InlangConfig["writeResources"]>[0] &
  InlangEnvironment

async function writeResources({
  $fs: rawFs,
  config,
  resources,
}: WriteResourcesArgs): ReturnType<InlangConfig["writeResources"]> {
  const $fs = patchFs(rawFs)

  // @ts-expect-error - the types slightly differ; should work regardless
  const typesafeI18nConfig = await getConfig($fs)

  for (const resource of resources) {
    const locale = resource.languageTag.name
    const dictionary = serializeResource(resource)

    const type =
      locale === config.referenceLanguage ? "BaseTranslation" : "Translation"
    // TODO: path could be wrong if esmImports=true
    // TODO: export utility type from `typesafe-i18n` to get correct string e.g. with `satisfies` syntax
    const template = `import type { ${type} } from '${resolve(
      typesafeI18nConfig.outputPath,
      typesafeI18nConfig.typesFileName
    )}'
const ${locale}: ${type} = ${dictionary}

export default ${locale}`

    await $fs.writeFile(
      resolve(typesafeI18nConfig.outputPath, `${locale}/index.ts`),
      template
    )
  }
}

const serializeResource = (resource: ast.Resource): string => {
  const json = {} as Record<string, any>

  resource.body.map(serializeMessage).forEach(([id, value]) => {
    const idParts = id.split('.')
    let current = json
    for (let i = 0; i < idParts.length; i++) {
      const part = idParts[i]
      if (i === idParts.length - 1) {
        current[part] = value
      } else {
        if (!current[part]) current[part] = {}
        current = current[part]
      }
    }
  })
  // stringify the object with beautification
  return JSON.stringify(json, null, 3)
}

const serializeMessage = (message: ast.Message): [id: string, value: string] => {
  return [message.id.name, serializePattern(message.pattern)]
}

const serializePattern = (pattern: ast.Pattern): string => {
  return pattern.elements.map(serializePatternElement).join("")
}

const serializePatternElement = (
  element: ast.Pattern["elements"][number]
): string => {
  switch (element.type) {
    case "Text":
      return element.value
    case "Placeholder":
      return serializePlaceholder(element)
  }
}

const serializePlaceholder = ({ body: { name, metadata = {} } }: ast.Placeholder): string => {
  let str = name
  if (metadata.optional) str += "?"
  if (metadata.types?.length > 0) {
    str += `:${metadata.types.join("|")}`
  }
  if (metadata.transforms?.length > 0) {
    str += `|${metadata.transforms.join("|")}`
  }
  return `{${str}}`
}