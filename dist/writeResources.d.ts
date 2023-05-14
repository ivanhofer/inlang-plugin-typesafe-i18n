import type { InlangConfig } from "@inlang/core/config";
import type { InlangEnvironment } from "@inlang/core/environment";
type WriteResourcesArgs = Parameters<InlangConfig["writeResources"]>[0] & InlangEnvironment;
export declare function writeResources({ $fs: rawFs, config, resources, }: WriteResourcesArgs): ReturnType<InlangConfig["writeResources"]>;
export {};
