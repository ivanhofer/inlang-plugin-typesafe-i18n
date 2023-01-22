// @ts-ignore
import { defineConfig } from "../example/inlang.config.js";
import { describe, it, expect } from "vitest";
import nodeFs from "node:fs";
import { fs as memfs } from "memfs";
import {
  initialize$import,
  Config,
  EnvironmentFunctions,
} from "@inlang/core/config";
import { query } from "@inlang/core/query";

const env = await initializeTestEnvironment();
const config = (await defineConfig(env)) as Config;

describe("plugin", async () => {
  const resources = await config.readResources({ config });
  const referenceResource = resources.find(
    (resource) => resource.languageTag.name === config.referenceLanguage
  )!;

  describe("readResources()", async () => {
    it("should return an array of resources that matches config.languages", () => {
      expect(resources.length).toBe(config.languages.length);
      for (const resource of resources) {
        expect(config.languages.includes(resource.languageTag.name));
      }
    });

    it("should be possible to query a message", () => {
      const message = query(referenceResource).get({ id: "HI" });
      expect(message).toBeDefined();
      expect(message?.pattern.elements[0].value).toBe(
        "Hi {name:string}! Please leave a star if you like this project: https://github.com/ivanhofer/typesafe-i18n"
      );
    });
  });

  describe("writeResources()", async () => {
    it("should serialize the resources", async () => {
      const updatedReferenceResource = query(referenceResource)
        .create({
          message: {
            id: { type: "Identifier", name: "new-message" },
            type: "Message",
            pattern: {
              type: "Pattern",
              elements: [{ type: "Text", value: "Newly created message" }],
            },
          },
        })
        .unwrap();
      const updatedResources = [
        ...resources.filter(
          (resource) =>
            resource.languageTag.name !== config.referenceLanguage
        ),
        updatedReferenceResource,
      ];
      await config.writeResources({ config, resources: updatedResources });
      const module =
        (await env.$fs.readFile(
          `/example/${config.referenceLanguage}.ts`,
          "utf-8"
        )) as string
      expect(module.includes('"new-message": "Newly created message"')).toBeTruthy();
    });
  });
});

/**
 * Initializes the environment.
 *
 * Copies files in /dist and /example to the in-memory file system.
 */
async function initializeTestEnvironment(): Promise<EnvironmentFunctions> {
  const $fs = memfs.promises;

  // change the working directory to the inlang config directory to resolve relative paths
  process.cwd = () => "/example";
  const $import = initialize$import({
    workingDirectory: "/example",
    fs: $fs,
    fetch,
  });

  const env = {
    $fs,
    $import,
  };

  const copyDirectory = async (path: string) => {
    // create directory
    await $fs.mkdir(path, { recursive: true });

    for (const file of await nodeFs.promises.readdir("./" + path)) {
      const isFile = file.indexOf('.') > -1
      if (isFile) {
        await $fs.writeFile(
          `${path}/${file}`,
          await nodeFs.promises.readFile(`./${path}/${file}`, "utf-8"),
          { encoding: "utf-8" }
        );
      } else {
        await copyDirectory(`${path}/${file}`)
      };
    }
  }

  // only /dist and /example are needed and therefore copied
  for (const path of ["/dist", "/example"]) {
    await copyDirectory(path)
  }

  return env;
}
