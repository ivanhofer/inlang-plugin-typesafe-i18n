export declare const plugin: {
    meta: {
        id: "ivanhofer.plugin.typesafe-i18n";
        displayName: {
            en: string;
        };
        description: {
            en: string;
        };
        marketplace: {
            publisherName: string;
            publisherIcon: string;
            linkToReadme: {
                en: string;
            };
            icon: string;
            keywords: string[];
        };
    };
    loadMessages: ({ nodeishFs, languageTags }: {
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
    saveMessages: ({ nodeishFs, messages }: {
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
};
