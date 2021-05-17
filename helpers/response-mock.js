module.exports = {
  error: (res, code = 500, message = "Internal error", data = null) => {
    return res.status(code).json({ errors: { type: message, data } });
  },
  success: (res, code = 200, message = "Success", data = null) => {
    return res.status(code).json({ success: { type: message, data } });
  },
};
