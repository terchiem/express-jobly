/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "test";

const PORT = +process.env.PORT || 3000;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'jobly-test'
// - else: 'jobly'

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "jobly-test";
} else {
  DB_URI = process.env.DATABASE_URL || "jobly";
}

const ERROR_MESSAGES = {
  companyNotFound: `Cannot find company for `,
  companyAlreadyExists: `Company already exists for `,
  companyMinMaxEmployees: "Min cannot be larger than Max!",
  jobNotFound: `Cannot find job with id `,
  jobCreate: "Error creating new job.",
  jobEquity: "Min equity cannot be greater than 1"
}

module.exports = {
  SECRET_KEY,
  PORT,
  DB_URI,
  ERROR_MESSAGES
};
