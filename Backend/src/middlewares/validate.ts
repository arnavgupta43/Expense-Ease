import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { StatusCodes } from "http-status-codes";
type validationSchema = {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
};
// new joi validation so we can check all body,query and params 
export const validate = (schemas: validationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationTargets: (keyof validationSchema)[] = [
      "body",
      "query",
      "params",
    ];
    for (const key of validationTargets) {
      const schema = schemas[key];
      if (schema) {
        const { error, value } = schema.validate(req[key], {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          }));
          return res.status(StatusCodes.BAD_REQUEST).json({
            status: "error",
            message: "Validation failed",
            errors,
          });
        }
        req[key] = value;
      }
    }
    next();
  };
};