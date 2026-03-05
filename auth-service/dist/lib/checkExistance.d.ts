import { User } from "../generated/client.js";
declare const findUser: (email: string) => Promise<User | null>;
export default findUser;
