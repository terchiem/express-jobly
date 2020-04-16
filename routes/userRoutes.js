const express = require("express");
const User = require("../models/users");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");
//const updateUserSchema = require("../schemas/updateUserSchema.json");

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
// PATCH /jobs/[id]
// This should update an existing job and return the updated job.

// This should return JSON of {job: jobData}
// */

router.patch("/:id", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateJobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const job = await Job.update(req.body.job, req.params.id);

    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


// /**
// DELETE /jobs/[id]
// This should remove an existing job and return a message.

// This should return JSON of {message: "Job deleted"}
// */

router.delete("/:id", async function (req, res, next) {
  try {
    await Job.delete(req.params.id);

    return res.json({ message: "Job deleted" });
  } catch (err) {
    return next(err);
  }
})


module.exports = router;