const express = require("express");
const Company = require("../models/companies");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const updateCompanySchema = require("../schemas/updateCompanySchema.json");


const router = new express.Router();

/** GET /
 *  Returns all companies by default. If a query string is included with a search term
 *  or min/max employees, performs a specified query instead.
 *  This should return JSON of {companies: [companyData, ...]}
 **/

router.get("/", async function(req, res, next){
  try {
    let result;
    const { search, min_employees, max_employees } = req.query;

    if(search || min_employees || max_employees) {
      if (Number(min_employees) > Number(max_employees)) {
        throw new ExpressError("Min cannot be larger than Max!", 400);
      }

      result = await Company.getByQueries(search, min_employees, max_employees);
    } else {
      result = await Company.all();
    }

    const companies = result.map( c => ({handle: c.handle, name: c.name}));
  
    return res.json({ companies });
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

/**
GET /companies/[handle]
This should return a single company found by its id.

This should return JSON of {company: companyData}
 */
router.get("/:handle", async function(req, res, next) {
  try {
    const company = await Company.get(req.params.handle);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
})


/** 
PATCH /companies/[handle]
This should update an existing company and return the updated company.

This should return JSON of {company: companyData}
*/

router.patch("/:handle", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateCompanySchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }

    const company = await Company.update(req.body.company, req.params.handle);

    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});


/**
DELETE /companies/[handle]
This should remove an existing company and return a message.

This should return JSON of {message: "Company deleted"}
*/

router.delete("/:handle", async function (req, res, next) {
  try {
    const result = await Company.delete(req.params.handle);

    return res.json({ message: "Company deleted" });
  } catch (err) {
    return next(err);
  }
})


module.exports = router;