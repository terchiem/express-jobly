const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

const { ERROR_MESSAGES } = require("../config");


class Company {

  /**
   * Returns all companies:
   * [{handle, name, num_employees, description, logo_url}, ...]
   */
  static async all() {
    const result = await db.query(`
      SELECT handle,
             name,
             num_employees,
             description,
             logo_url
             FROM companies
             ORDER BY handle DESC`);

    return result.rows;
  }

  /** 
   * Returns one company by handle name:
   * {handle, name, num_employees, description, logo_url, jobs: [ jobData, ... ]}
   */

  static async get(handle) {
    const result = await db.query(`
      SELECT handle,
             name,
             num_employees,
             description,
             logo_url
             FROM companies
             WHERE handle=$1`,
      [handle]);

    if (result.rows.length === 0) {
      throw new ExpressError(ERROR_MESSAGES.companyNotFound + handle, 404);
    }

    let company = result.rows[0];

    const jobsResult = await db.query(`
      SELECT id,
             title,
             salary,
             equity,
             date_posted
             FROM jobs
             WHERE company_handle=$1`,
             [handle]);

    company.jobs = jobsResult.rows;

    return company;
  }

  /**
   * Create a new company, accepts an object:
   * {handle, name, num_employees, description, logo_url}
   * 
   * Returns the new company:
   * {handle, name, num_employees, description, logo_url}
   */

  static async create({ handle, name, num_employees, description, logo_url }) {
    
    // check if company handle already exists in the database
    const company = await db.query(`SELECT handle FROM companies WHERE handle = $1`, [handle]);
    if (company.rows.length) {
      throw new ExpressError(ERROR_MESSAGES.companyAlreadyExists + handle, 400);
    }


    // TODO: try/catch block, can parse error
    // MVCC 

    // create new company
    const result = await db.query(`
      INSERT INTO companies (
        handle, 
        name, 
        num_employees, 
        description, 
        logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]);

    return result.rows[0];
  }

  /**
   * Update an existing company, accepts an object:
   * {handle, name, num_employees, description, logo_url}
   * 
   * Returns the result of the update
   * {handle, name, num_employees, description, logo_url}
   */

  static async update(items, handle) {
    const sql = sqlForPartialUpdate("companies", items, "handle", handle);

    const result = await db.query(sql.query, sql.values);

    if (result.rows.length === 0) {
      throw new ExpressError(ERROR_MESSAGES.companyNotFound + handle, 404);
    }

    return result.rows[0];
  }

  /**
   * Delete a company, accepts a string:
   * handle
   * 
   * Returns the deleted company:
   * {handle, name, num_employees, description, logo_url}
   */

  static async delete(handle) {
    const result = await db.query(`
      DELETE from companies
      WHERE handle=$1
      RETURNING 
        handle,
        name,
        num_employees,
        description,
        logo_url`,
      [handle])

    if (result.rows.length === 0) {
      throw new ExpressError(ERROR_MESSAGES.companyNotFound, 404);
    }
    
    return result.rows[0];
   }


  /**
   * Search for companies by search term that have a number of employees
   * between min and max. (max defaults to largest value possible for sql integers)
   * 
   * Returns an array of companies:
   * [{handle, name, num_employees, description, logo_url}, ...]
   * 
   */

  static async getByQueries(searchTerms) {
    let queries = [];
    let terms = [];
    let startingPosition = 1;
    
    if (searchTerms.search) { 
      queries.push(`(name ILIKE $${startingPosition} OR handle ILIKE $${startingPosition})`);
      terms.push(`${searchTerms.search}%`);
      startingPosition++;
    }

    if (searchTerms.min_employees) {
      queries.push(`num_employees >= $${startingPosition}`);
      terms.push(searchTerms.min_employees);
      startingPosition++
    }

    if (searchTerms.max_employees) {
      queries.push(`num_employees <= $${startingPosition}`);
      terms.push(searchTerms.max_employees);
      startingPosition++
    }

    const query = `SELECT handle,
                          name,
                          num_employees,
                          description,
                          logo_url
                          FROM companies
                          WHERE ${queries.join(" AND ")}
                          ORDER BY handle DESC`;
 
    const result = await db.query(query, terms);

    return result.rows;
  }
}


module.exports = Company;
