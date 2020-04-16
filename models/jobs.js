const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

const { ERROR_MESSAGES: {jobEquity, jobNotFound, jobCreate }} = require("../config");


class Job {

  /**
   * Returns all jobs:
   * [{title, company_handle}, ...] ordered by time posted
   */
  static async all() {
    const result = await db.query(`
      SELECT title,
             company_handle
             FROM jobs
      ORDER BY date_posted DESC`);

    return result.rows;
  }

  /** 
   * Returns one job by id, with the full company data object:
   * {title, salary, equity, company: {handle, name, num_employees, description, logo_url}, date_posted}
   */

  static async get(id) {
    const result = await db.query(`
      SELECT title,
             salary,
             equity,
             date_posted,
             companies.handle,
             companies.name,
             companies.num_employees,
             companies.description,
             companies.logo_url
             FROM jobs
      JOIN companies
      ON jobs.company_handle = companies.handle
      WHERE id=$1`,
      [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(jobNotFound + id, 404);
    }
    const {title, salary, equity, date_posted, 
           handle, name, num_employees, description, logo_url} = result.rows[0] //destructure company data

    const jobObj = { 
      title,
      salary,
      equity,
      company: {handle,
                name,
                num_employees,
                description,
                logo_url}, 
      date_posted
    }

    return jobObj;
  }

  /**
   * Create a new job, accepts an object:
   * {title, salary, equity, company_handle}
   * 
   * Returns the new job:
   * {id, title, salary, equity, company_handle, date_posted}
   */

  static async create({ title, salary, equity, company_handle }) { 
    try {
    // create new job
    const result = await db.query(`
      INSERT INTO jobs (
        title, 
        salary, 
        equity, 
        company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle, date_posted`,
      [title, salary, equity, company_handle]);

    return result.rows[0];
    } catch(err){
      throw new ExpressError(jobCreate, 400);
    }
  }

  /**
   * Update an existing job, accepts an object:
   * {title, salary, equity, company_handle}
   * 
   * Returns the result of the update:
   * {id, title, salary, equity, company_handle, date_posted}
   */

  static async update(items, id) {
    try {
      const returnValues = ["id", "title", "salary", "equity", "company_handle", "date_posted"]
      const sql = sqlForPartialUpdate("jobs", items, "id", id, returnValues);
      const result = await db.query(sql.query, sql.values);

      return result.rows[0];
    } catch (err) {
      throw new ExpressError(jobNotFound + id, 404);
    }  
  }

  /**
   * Delete a job, accepts a integer: id
   * 
   * Returns the deleted company:
   * {handle, name, num_employees, description, logo_url}
   */

  static async delete(id) {

    try {
      const result = await db.query(`
        DELETE from jobs
        WHERE id=$1
        RETURNING id, title, salary, equity, company_handle, date_posted`,
        [id])

      if (result.rows.length === 0) {
        throw new ExpressError(jobNotFound + id, 404);
      }

      return result.rows[0];
    } catch (err) {
      throw new ExpressError(jobNotFound + id, 404);
    }
  }


  /**
   * Search for companies by search term that have a number of employees
   * between min and max. (max defaults to largest value possible for sql integers)
   * 
   * Returns an array of companies:
   * [{handle, name, num_employees, description, logo_url}, ...]
   * 
   */

  static async getByQueries({ search, min_salary, min_equity }) {   
    if(Number(min_equity) > 1) {
      throw new ExpressError(jobEquity, 400);
    }
    
    let queries = [];
    let terms = [];
    let startingPosition = 1;

    if (search) { 
      queries.push(`(title ILIKE $${startingPosition} OR company_handle ILIKE $${startingPosition})`);
      terms.push(`${search}%`);
      startingPosition++;
    }

    if (min_salary) {
      queries.push(`salary >= $${startingPosition}`);
      terms.push(min_salary);
      startingPosition++
    }

    if (min_equity) {
      queries.push(`equity >= $${startingPosition}`);
      terms.push(min_equity);
      startingPosition++
    }

    const query = `SELECT title,
                          company_handle
                          FROM jobs
                          WHERE ${queries.join(" AND ")}
                          ORDER BY date_posted DESC`;
 
    const result = await db.query(query, terms);

    return result.rows;
  }
}


module.exports = Job;
