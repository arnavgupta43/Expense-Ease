import Joi from "joi";

export const validatecreateBill = {
  body: Joi.object({
    title: Joi.string().required().min(5).max(30).messages({
      "string.min": "Title should be of length 5",
      "any.required": "Title is required",
    }),
  }),
  totalAmount: Joi.number().required().positive().messages({
    "any.required": "Amountis required",
    "number.base": "Amount should be a number",
  }),
  participants: Joi.array()
    .items(
      Joi.object({
        userId: Joi.number().required().positive().integer().messages({
          "base.number": "userId should be a number",
        }),
        amountOwed: Joi.number()
          .positive()
          .required()
          .integer()
          .messages({ "number.base": "Amount must be a number" }),
      })
    )
    .unique("userId"),
};

export const upadteDeleteBill = {
  params: Joi.object({
    id: Joi.number()
      .positive()
      .required()
      .messages({ "number.base": "BillId must be a number" }),
  }),
};
