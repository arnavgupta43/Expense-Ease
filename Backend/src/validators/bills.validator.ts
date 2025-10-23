import Joi from "joi";

export const validatecreateBill = {
  body: Joi.object({
    title: Joi.string().required().min(5).messages({
      "string.min": "Title should be of length 5",
      "any.required": "Title is required",
    }),
  }),
  amount: Joi.number().required().greater(0).messages({
    "any.required": "Amountis required",
    "number.base": "Amount should be a number",
  }),
  participants: Joi.required(),
};
