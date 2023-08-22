export declare const saveMessages: ({ nodeishFs, messages }: {
    messages: {
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
    }[];
    settings: unknown;
    nodeishFs: import("@inlang/plugin").NodeishFilesystemSubset;
}) => Promise<void>;
