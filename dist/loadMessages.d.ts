export declare const loadMessages: ({ nodeishFs, languageTags }: {
    languageTags: string[];
    settings: unknown;
    nodeishFs: import("@inlang/plugin").NodeishFilesystemSubset;
}) => Promise<{
    id: string;
    selectors: {
        type: "VariableReference";
        name: string;
    }[];
    variants: {
        pattern: ({
            type: "Text";
            value: string;
        } | {
            type: "VariableReference";
            name: string;
        })[];
        languageTag: string;
        match: Record<string, string>;
    }[];
}[]>;
export type ParameterMetadata = any;
export declare const globalMetadata: Record<string, Record<string, ParameterMetadata>>;
