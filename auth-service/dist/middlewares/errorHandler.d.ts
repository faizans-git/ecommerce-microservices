import type { Request, Response, NextFunction } from "express";
declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
