import type { NodeishFilesystemSubset } from '@inlang/plugin';
export declare const getDictionaryForLocale: ($fs: NodeishFilesystemSubset, outputPath: string, locale: string) => Promise<any>;
export declare const patchFs: (fs: NodeishFilesystemSubset) => NodeishFilesystemSubset;
export declare const resolve: (...parts: string[]) => string;
