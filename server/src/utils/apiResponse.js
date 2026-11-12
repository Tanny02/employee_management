export const successResponse = (res, { message = "Success", data = null, meta = null, statusCode = 200 } = {}) => {
  return res.status(statusCode).json({ success: true, message, data, ...(meta ? { meta } : {}) });
};
