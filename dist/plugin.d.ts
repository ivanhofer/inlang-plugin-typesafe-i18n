export declare const plugin: {
    meta: {
        id: string;
        displayName: {
            en: string;
        };
        description: {
            en: string;
        };
        keywords: string[];
    };
    loadMessages: ({ nodeishFs, languageTags }: {
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
    saveMessages: ({ nodeishFs, messages }: {
        messages: {
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
        }[];
        options: unknown;
        nodeishFs: import("@inlang/plugin").NodeishFilesystemSubset;
    }) => Promise<void>;
};
