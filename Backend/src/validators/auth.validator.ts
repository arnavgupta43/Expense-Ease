import Joi from "joi";
//defining the schema for data validation for login and register auth controllers
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().min(8).messages({
    "any.required": "Password is required",
    "string.min": "Password should be of minimum 8 character",
  }),
});
export const registerSchema = Joi.object({
  name: Joi.string().min(4).required().messages({
    "string.min": "Name must be of minimum 5 letters",
    "any.required": "Name is required",
  }),
  username: Joi.string().min(4).required().messages({
    "any.required": "username is required",
    "string.min": "username should be minimum 5 letters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().min(8).messages({
    "any.required": "Password is required",
    "string.min": "PAssword should be of minimum 8 character",
  }),
});
