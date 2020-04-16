const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")

const { ERROR_MESSAGES } = require("../config");


class User {

  /**
   * Returns all users:
   * [{username, first_name, last_name, email}, ...]
   */
  static async all() {
    const result = await db.query(`
      SELECT username,
             first_name,
             last_name,
             email
             FROM users
             ORDER BY username`);

    return result.rows;
  }

  /** 
   * Returns one user by username:
   * {username, first_name, last_name, email, photo_url}
   */

  static async get(username) {
    const result = await db.query(`
      SELECT username,
             first_name,
             last_name,
             email
             FROM users
             WHERE id=$1`,
      [username]);

    if (result.rows.length === 0) {
      throw new ExpressError(ERROR_MESSAGES.userNotFound + username, 404);
    }

    return result.rows[0];
  }

  // /**
  //  * Create a new job, accepts an object:
  //  * {title, salary, equity, company_handle}
  //  * 
  //  * Returns the new job:
  //  * {id, title, salary, equity, company_handle, date_posted}
  //  */

  // static async create({ title, salary, equity, company_handle }) { 
  //   try {
  //   // create new job
  //   const result = await db.query(`
  //     INSERT INTO jobs (
  //       title, 
  //       salary, 
  //       equity, 
  //       company_handle)
  //       VALUES ($1, $2, $3, $4)
  //       RETURNING id, title, salary, equity, company_handle, date_posted`,
  //     [title, salary, equity, company_handle]);

  //   return result.rows[0];
  //   } catch(err){
  //     throw new ExpressError(ERROR_MESSAGES.jobCreate, 400);
  //   }
  // }

  // /**
  //  * Update an existing job, accepts an object:
  //  * {title, salary, equity, company_handle}
  //  * 
  //  * Returns the result of the update:
  //  * {id, title, salary, equity, company_handle, date_posted}
  //  */

  // static async update(items, id) {
  //   try {
  //     const sql = sqlForPartialUpdate("jobs", items, "id", id);
  //     const result = await db.query(sql.query, sql.values);

  //     return result.rows[0];
  //   } catch (err) {
  //     throw new ExpressError(ERROR_MESSAGES.jobNotFound + id, 404);
  //   }  
  // }

  // /**
  //  * Delete a job, accepts a integer: id
  //  * 
  //  * Returns the deleted company:
  //  * {handle, name, num_employees, description, logo_url}
  //  */

  // static async delete(id) {
  //   try {
  //     const result = await db.query(`
  //       DELETE from jobs
  //       WHERE id=$1
  //       RETURNING id, title, salary, equity, company_handle, date_posted`,
  //       [id])

  //     return result.rows[0];
  //   } catch (err) {
  //     throw new ExpressError(ERROR_MESSAGES.jobNotFound + id, 404);
  //   }
  //  }


  // /**
  //  * Search for companies by search term that have a number of employees
  //  * between min and max. (max defaults to largest value possible for sql integers)
  //  * 
  //  * Returns an array of companies:
  //  * [{handle, name, num_employees, description, logo_url}, ...]
  //  * 
  //  */

  // static async getByQueries(searchTerms) {    
  //   let queries = [];
  //   let terms = [];
  //   let startingPosition = 1;
    
  //   if (searchTerms.search) { 
  //     queries.push(`(title ILIKE $${startingPosition} OR company_handle ILIKE $${startingPosition})`);
  //     terms.push(`${searchTerms.search}%`);
  //     startingPosition++;
  //   }

  //   if (searchTerms.min_salary) {
  //     queries.push(`salary >= $${startingPosition}`);
  //     terms.push(searchTerms.min_salary);
  //     startingPosition++
  //   }

  //   if (searchTerms.min_equity) {
  //     queries.push(`equity >= $${startingPosition}`);
  //     terms.push(searchTerms.min_equity);
  //     startingPosition++
  //   }

  //   const query = `SELECT title,
  //                         company_handle
  //                         FROM jobs
  //                         WHERE ${queries.join(" AND ")}
  //                         ORDER BY date_posted DESC`;
 
  //   const result = await db.query(query, terms);

  //   return result.rows;
  // }
}


module.exports = Job;
