const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { ERROR_MESSAGES: { authNotLoggedIn, authNotSameUser, authNotAdmin } } = require("../config");
const ExpressError = require("./expressError");

/** Auth JWT token, add auth'd user (if any) to req. 
 * Taken from Rithm lecture "Hashing and JWTs with Node"
*/

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    // error in this middleware isn't error -- continue on
    return next();
  }
}

/** Middleware for routes. Ensures the visitor has proper JWT token. 
 * Taken from Rithm lecture "Hashing and JWTs with Node"
*/

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const err = new ExpressError(authNotLoggedIn, 401);
    return next(err);
  } else {
    return next();
  }
}

/** Middleware for routes. Ensures the user attempting to 
 * modify resource at /user[username] has logged in as
 * that user.
 */

function ensureSameUser(req, res, next) {
  if (!req.user || req.user.username !== req.params.username) {
    const err = new ExpressError(authNotSameUser, 403); //401 would be more appropriate here
    return next(err);
  } else {
    return next();
  }
}

/** Middleware for routes. Ensures the user attempting to 
 * modify resource at /jobs[id] or /companies[handle] has logged in as
 * an admin.
 */

function ensureAdmin(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    const err = new ExpressError(authNotAdmin, 403);
    return next(err);
  } else {
    return next();
  }
}

module.exports = {authenticateJWT, ensureLoggedIn, ensureSameUser, ensureAdmin};