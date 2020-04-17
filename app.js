/** Express app for jobly. */

const express = require("express");
const ExpressError = require("./helpers/expressError");
const morgan = require("morgan");
const User = require("./models/users");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, ERROR_MESSAGES:{authInvalidPassword} } = require("./config");
const {authenticateJWT } = require("./helpers/auth");

const app = express();
app.use(express.json());

// add logging system
app.use(morgan("tiny"));

//add authentication
app.use(authenticateJWT);

// Resource routes
const companiesRoutes = require("./routes/companiesRoutes");
app.use("/companies", companiesRoutes);
const jobsRoutes = require("./routes/jobsRoutes");
app.use("/jobs", jobsRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

//Authentication route
app.post("/login", async function(req, res, next){
  try {
    const {username, password} = req.body;
    const user_status = await User.authenticate(username, password)
    if (user_status.valid) {
      const payload = {username, is_admin: user_status.is_admin}
      const token = jwt.sign(payload, SECRET_KEY)

      return res.json({ token });
    } else {
      throw new ExpressError(authInvalidPassword, 400)
    }

  } catch(err) {
    return next(err);
  }
});


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
