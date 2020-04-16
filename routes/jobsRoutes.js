const express = require("express");
const Job = require("../models/jobs");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema.json");
const updateJobSchema = require("../schemas/updateJobSchema.json");


const router = new express.Router();

// /** GET /
//  *  Returns all jobs by default. If a query string is included with a search term
//  *  or min equity or salary, performs a specified query instead.
//  *  This should return JSON of {jobs: [jobData, ...]}
//  **/

router.get("/", async function(req, res, next){
  try {
    let result;
    const {search, min_salary, min_equity } = req.query;

    if(search || min_salary || min_equity) {
      result = await Job.getByQueries(req.query);
    } else {
      result = await Job.all();
    }

    const jobs = result.map( j => ({title: j.title, company_handle: j.company_handle}));
  
    return res.json({ jobs });
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
    const result = jsonschema.validate(req.body, jobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const newJob = await Job.create(req.body.job);

    return res.json({job: newJob}); 

  } catch(err) {
    return next(err);
  }
})

// /**
// GET /job/[handle]
// This should return a single job found by its id.

// This should return JSON of {job: jobData}
//  */
router.get("/:id", async function(req, res, next) {
  try {
    const job = await Job.get(req.params.id);

    return res.json({ job });
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
    const result = await Job.delete(req.params.id);

    return res.json({ message: "Job deleted" });
  } catch (err) {
    return next(err);
  }
})


module.exports = router;