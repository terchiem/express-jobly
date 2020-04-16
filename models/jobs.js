const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")


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
             company_handle,
             date_posted,
             companies.name,
             companies.num_employees,
             companies.description,
             companies.logo_url
             FROM jobs
             WHERE id=$1
      JOIN companies
      ON jobs.company_handle = companies.handle`,
      [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot find job for ${id}`, 404);
    }
    const d = result.rows[0];

    const jobObj = { 
      title: d.title,
      salary: d.salary,
      equity: d.equity,
      company: {handle: d.company_handle,
                name: d.name,
                num_employees: d.num_employees,
                description: d.description,
                logo_url: d.logo_url}, 
      date_posted: d.date_posted
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
      throw new ExpressError("Error creating new job.", 400)
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
    const sql = sqlForPartialUpdate("jobs", items, "id", id);

    const result = await db.query(sql.query, sql.values);

    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot find job for ${id}`, 404);
    }

    return result.rows[0];
  }

  /**
   * Delete a job, accepts a integer: id
   * 
   * Returns the deleted company:
   * {handle, name, num_employees, description, logo_url}
   */

  static async delete(id) {
    const result = await db.query(`
      DELETE from jobs
      WHERE id=$1
      RETURNING id, title, salary, equity, company_handle, date_posted`,
      [id])

    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot find job for ${id}`, 404);
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

  static async getByQueries(searchTerm, minSalary, minEquity) {

    const search = searchTerm ? `AND (title ILIKE $1 OR company_handle ILIKE $1)` : '';
    const salary = minSalary ? `AND salary > $2` : '';
    const equity = minEquity ? `AND equity > $3` : '';
 
    const query = `SELECT title,
                          company_handle
                          FROM jobs
                          WHERE id>=1 ${search} ${salary} ${equity}`;

    const result = await db.query(query, [`${searchTerm}%`, minSalary, minEquity]);

    return result.rows;
  }
}


module.exports = Job;
