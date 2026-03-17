export declare const generateOtp: (userId: string) => Promise<string>;
export declare const verifyOtp: (userId: string, code: string) => Promise<boolean>;
