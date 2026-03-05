import { User, Role } from "../generated/client.js";
export interface TokenPayload {
    userId: string;
    username: string;
    role: Role;
}
export interface AuthTokens {
    jwtToken: string;
    refreshToken: string;
}
declare const generateTokens: (user: User) => Promise<AuthTokens>;
export default generateTokens;
