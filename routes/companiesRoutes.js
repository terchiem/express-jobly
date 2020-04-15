const express = require("express");
const Company = require("../models/companies");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");


const router = new express.Router();

/** GET /
 *
 **/

router.get("/", async function(req, res, next){
  try {
  
  const result = await Company.all();
  const cleanResult = result.map( c => ({handle: c.handle, name: c.name}));
  
  return res.json({companies: cleanResult});

  } catch(err) {
    return next(err);
  }
});

/**POST /companies
This should create a new company and return the newly created company.

This should return JSON of {company: companyData}
*/

router.post("/", async function(req, res, next) {
  try {
    const result = jsonschema.validate(req.body, companySchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

  const newCompany = await Company.create(req.body.company);

  return res.json({company: newCompany});

  } catch(err) {
    return next(err);
  }
})

module.exports = router;