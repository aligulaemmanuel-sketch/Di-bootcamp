/** Express 4 does not catch errors from async handlers; this forwards them to the error middleware. */
module.exports = function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}
