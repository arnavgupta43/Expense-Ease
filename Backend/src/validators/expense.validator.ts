import Joi from "joi";
//defining the schema for data validation for personal expense

export const createExpnese = {
  body: Joi.object({
    amount: Joi.number().required().messages({
      "number.base": "Amount should be a number",
      "any.required": "Amount is reqired",
    }),
    title: Joi.string()
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
        "string.min": "Title should be of min length 4",
        "any.required": "Title is required",
      }),
    category: Joi.string().required().min(4).messages({
      "string.min": "Title should be of min length 4",
      "any.required": "Title is required",
    }),
    note: Joi.string().required().min(4).messages({
      "string.min": "Title should be of min length 4",
      "any.required": "Title is required",
    }),
    date: Joi.date().default(() => new Date()),
  }),
};
