export declare const hashPassword: (plainPassword: string) => Promise<string>;
export declare const verifyPassword: (hashedPassword: string, plainPassword: string) => Promise<boolean>;
