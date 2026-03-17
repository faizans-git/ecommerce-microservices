import type { Request, Response } from "express";
export declare const verifyOtpController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendOtpController: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
