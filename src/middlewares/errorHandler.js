export function errorHandler(err, req, res, next) {
  const { message } = err;
  res.status(500).json({
    status: 500,
    message: 'Something went wrong!',
    data: message,
  });
}
