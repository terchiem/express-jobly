const express = require("express");
const User = require("../models/users");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
const updateUserSchema = require("../schemas/updateUserSchema.json");

const router = new express.Router();

// /** GET /
//  *  Returns all users.
//  *  Returns JSON of {users: [userData, ...]}
//  **/

router.get("/", async function(req, res, next){
  try {
    const users = await User.all();

    return res.json({ users });
  } catch(err) {
    return next(err);
  }
});

/**POST /jobs
This should create a new job and return the newly created job.

This should return JSON of {job: jobData}
*/

router.post("/", async function(req, res, next) {
  try {
    const result = jsonschema.validate(req.body, userSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const newUser = await User.create(req.body.user);

    return res.json({user: newUser}); 

  } catch(err) {
    return next(err);
  }
})

// /**
// GET /user/[username]
// This should return a single user found by its userName.

// This should return JSON of {user: userData}
//  */
router.get("/:username", async function(req, res, next) {
  try {
    const user = await User.get(req.params.username);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
})


// /** 
// PATCH /users/[username]
// This should update an existing user and return the updated user.

// This should return JSON of {user: userData}
// */

router.patch("/:username", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateUserSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const user = await User.update(req.body.user, req.params.username);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


// /**
// DELETE /users/[username]
// This should remove an existing user and return a message.

// This should return JSON of {message: "User deleted"}
// */

router.delete("/:username", async function (req, res, next) {
  try {
    await User.delete(req.params.username);

    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
})


module.exports = router;