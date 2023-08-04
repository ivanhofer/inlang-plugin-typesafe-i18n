export declare const saveMessages: (options: {
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
