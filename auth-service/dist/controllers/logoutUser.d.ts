import type { Request, Response } from "express";
declare const logoutUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export default logoutUser;
