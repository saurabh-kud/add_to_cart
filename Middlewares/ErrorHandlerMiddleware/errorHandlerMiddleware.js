const errorHandler = (err, req, res, next) => {
  res.status = res.status ? res.status : 500;
  res.json({
    status: false,

    message: err.message,
  });
};
module.exports = errorHandler;
