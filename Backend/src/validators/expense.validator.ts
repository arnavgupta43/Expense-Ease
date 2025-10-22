import Joi from "joi";
//defining the schema for data validation for personal expense

export const createExpnese = {
  body: Joi.object({
    amount: Joi.number().required().messages({
      "number.base": "Amount should be a number",
      "any.required": "Amount is reqired",
    }),
    title: Joi.string().required().min(4).messages({
      "string.min": "Title should be of min length 4",
      "any.required": "Title is required",
    }),
    category: Joi.string()
      .valid(
        "FOOD",
        "TRAVEL",
        "GROCERY",
        "SHOPPING",
        "RENT",
        "UTILITIES",
        "HEALTH",
        "ENTERTAINMENT",
        "EDUCATION",
        "SUBSCRIPTION",
        "OTHERS"
      )
      .required()
      .min(4)
      .messages({
        "any.only": "Category is not correct",
        "any.required": "Category is required",
      }),
    note: Joi.string().required().min(4).messages({
      "string.min": "Title should be of min length 4",
      "any.required": "Note is required",
    }),
    date: Joi.date().default(() => new Date()),
  }),
};

export const getExpenseByCategory = {
  query: Joi.object({
    category: Joi.required()
      .valid(
        "FOOD",
        "TRAVEL",
        "GROCERY",
        "SHOPPING",
        "RENT",
        "UTILITIES",
        "HEALTH",
        "ENTERTAINMENT",
        "EDUCATION",
        "SUBSCRIPTION",
        "OTHERS"
      )
      .messages({
        "any.only": "Category is not correct",
        "any.required": "Category is required",
      }),
  }),
};

export const updateValidator = {
  body: Joi.object({
    amount: Joi.number().messages({
      "number.base": "Amount should be a number",
    }),
    title: Joi.string().min(4).messages({
      "string.min": "Title should be of min length 4",
    }),
    category: Joi.string()
      .valid(
        "FOOD",
        "TRAVEL",
        "GROCERY",
        "SHOPPING",
        "RENT",
        "UTILITIES",
        "HEALTH",
        "ENTERTAINMENT",
        "EDUCATION",
        "SUBSCRIPTION",
        "OTHERS"
      )
      .messages({
        "any.only": "Category is not correct",
      }),
    note: Joi.string().min(4).messages({
      "string.min": "Title should be of min length 4",
    }),
    date: Joi.date(),
    expenseid: Joi.number().required().messages({
      "number.base": "expenseid should be a number",
      "any.required": "expenseid is required",
    }),
  }),
};
