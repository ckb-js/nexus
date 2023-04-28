export type Suffix<T extends string, P extends string> = T extends `${P}${infer S}` ? S : never;
