export declare const loadMessages: ({ nodeishFs, languageTags }: {
    languageTags: readonly string[];
    options: unknown;
    nodeishFs: import("@inlang/plugin").NodeishFilesystemSubset;
}) => Promise<{
    id: string;
    selectors: {
        type: "VariableReference";
        name: string;
    }[];
    body: Record<string, {
        pattern: ({
            type: "Text";
            value: string;
        } | {
            type: "VariableReference";
            name: string;
        })[];
        match: Record<string, string>;
    }[]>;
}[]>;
export type ParameterMetadata = any;
export declare const globalMetadata: Record<string, Record<string, ParameterMetadata>>;
