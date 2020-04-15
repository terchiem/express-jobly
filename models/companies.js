const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")


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
             FROM companies`);

    return result.rows;
  }

  /** 
   * Returns one company by handle name:
   * {handle, name, num_employees, description, logo_url}
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
      throw new ExpressError(`Cannot find company for ${handle}`, 404);
    }

    return result.rows[0];
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
      throw new ExpressError(`Company with handle ${handle} already exists!`, 400);
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
      throw new ExpressError(`Cannot find company for ${handle}`, 404);
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
      throw new ExpressError(`Cannot find company for ${handle}`, 404);
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

  static async getByQueries(searchTerm="", min=0, max=2147483647) {
    const result = await db.query(`
      SELECT handle,
             name,
             num_employees,
             description,
             logo_url
             FROM companies
             WHERE (handle ILIKE $1 OR name ILIKE $1) 
              AND num_employees BETWEEN $2 AND $3`, 
             [`%${searchTerm}%`, min, max]);        // ways to not include all WHERE clauses

    return result.rows;
  }
}


module.exports = Company;
