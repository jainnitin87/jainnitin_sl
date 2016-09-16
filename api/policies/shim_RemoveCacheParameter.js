/**
 *
 * This middleware removes the '_' parameter from the request query to prevent
 * it from getting used in the where clause. It gets added to all AJAX requests
 * by jQuery to prevent request caching by IE. We are doing this until it gets
 * added to Sails blacklist.
 * balderdashy/sails#1416
 */

module.exports = function (req, res, next) {
  sails.log.verbose('Removing _ parameter from request query')
  delete req.query._
  return next()
}
