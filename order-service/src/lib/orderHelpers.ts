import { AppError } from "../middlewares/errorMiddleware.js";

export const getSingleParam = (
  param: string | string[] | undefined,
  name: string,
): string => {
  if (!param) {
    throw new AppError(`${name} is required`, 400);
  }

  if (Array.isArray(param)) {
    if (param.length !== 1) {
      throw new AppError(`${name} must be a single value`, 400);
    }
    return param[0];
  }

  return param;
};
