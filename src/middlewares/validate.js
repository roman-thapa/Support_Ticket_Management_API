const AppError = require("../utils/appError");

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    return next(new AppError(result.error.errors[0].message, 400));
  }

  req.validatedData = result.data;
  next();
};

module.exports = validate;