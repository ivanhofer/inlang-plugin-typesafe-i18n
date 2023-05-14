import type { InlangEnvironment } from '@inlang/core/environment';
export declare const patchFs: (fs: InlangEnvironment["$fs"]) => import("@inlang/core/environment").$fs;
export declare const resolve: (...parts: string[]) => string;
