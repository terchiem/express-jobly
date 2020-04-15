const db = require("../db");
const ExpressError = require("../expressError");


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

  static async create({handle, name, num_employees, description, logo_url}) {
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


  // update company

  // delete company

}


module.exports = Company;
