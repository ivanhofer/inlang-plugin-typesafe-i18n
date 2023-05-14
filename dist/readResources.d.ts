import type { InlangConfig } from "@inlang/core/config";
import type { InlangEnvironment } from "@inlang/core/environment";
type ReadResourcesArgs = Parameters<InlangConfig["readResources"]>[0] & InlangEnvironment;
export declare function readResources({ config, $fs: rawFs, }: ReadResourcesArgs): ReturnType<InlangConfig["readResources"]>;
export {};
