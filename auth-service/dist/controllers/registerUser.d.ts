import type { Request, Response } from "express";
declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export default registerUser;
