import type { Request, Response } from "express";
declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export default loginUser;
