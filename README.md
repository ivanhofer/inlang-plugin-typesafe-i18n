# inlang plugin-template

> **Note**  
> 
> **Change the following things if you use this template:**
> 1. Name your repository "inlang-plugin-{name}".
> 2. Change the introduction paragraph to describe your plugin.
> 3. Create a release on GitHub so users can import a specific version of your plugin.
> 4. Update the Usage section.
> 5. Open a PR to https://github.com/inlang/awesome-inlang

This is a template for creating a new plugin for [inlang](https://inlang.com).

Plugins allow the customization of inlang's behavior by, for example, defining how resources should be parsed and serialized. Read more about using plugins on the [documentation site](https://inlang.com/documentation/plugins). This template has been set up to provide out of the box:

- [x] TypeScript
- [x] Testing (the example)
- [x] Bundling

## Usage

```js
// filename: inlang.config.js

export async function initializeConfig(env){
  const plugin = await env.$import(
    "https://cdn.jsdelivr.net/gh/{username}/{repository-name}@{version}/dist/index.js"
  ) 
}
```

For additional usage information, take a look at [example](./example/).

## Contributing

### Developing

Run the following commands in your terminal (node and npm must be installed):

1. `npm install`
2. `npm run dev`

`npm run dev` will start the development environment which automatically compiles the [src/index.ts](./src/index.ts) files to JavaScript ([dist/index.js](dist/index.js)), runs tests defined in `*.test.ts` files and watches changes.

### Publishing

Run `npm run build` to generate a build.

The [dist](./dist/) directory is used to distribute the plugin directly via CDN like [jsDelivr](https://www.jsdelivr.com/). Using a CDN works because the inlang config uses dynamic imports to import plugins.

Read the [jsDelivr documentation](https://www.jsdelivr.com/?docs=gh) on importing from GitHub.
