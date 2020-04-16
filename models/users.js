const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")
const bcrypt = require("bcrypt");
const { ERROR_MESSAGES:{ userCreate, userNotFound }, BCRYPT_WORK_FACTOR } = require("../config");


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
             WHERE username=$1`,
      [username]);

    if (result.rows.length === 0) {
      throw new ExpressError(ERROR_MESSAGES.userNotFound + username, 404);
    }

    return result.rows[0];
  }

  // /**
  //  * Create a new user, accepts an object:
  //  * {username, password, first_name, last_name, email, photo_url}
  //  * 
  //  * Returns the new user:
  //  * {username, first_name, last_name, email, photo_url}
  //  */

  static async create({ username, password, first_name, last_name, email, photo_url }) { 
    try {
      //encrypt plaintext password
      const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    
      // create new user
    const result = await db.query(`
      INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        email,
        photo_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]);

    return result.rows[0];
    } catch(err){
      throw new ExpressError(userCreate +": "+ err.message, 400);
    }
  }

  // /**
  //  * Update an existing user, accepts an object:
  //  * {username, first_name, last_name, email, photo_url}
  //  * 
  //  * Returns the result of the update:
  //  * {username, first_name, last_name, email, photo_url}
  //  */

  static async update(items, username) {
    try {
      const sql = sqlForPartialUpdate("users", items, "username", username);
      const result = await db.query(sql.query, sql.values);

      return result.rows[0];
    } catch (err) {
      throw new ExpressError(userNotFound + username, 404);
    }  
  }

  // /**
  //  * Delete a user, accepts a string: username
  //  * 
  //  * Returns the deleted user:
  //  * {username, first_name, last_name, email, photo_url}
  //  */

  static async delete(username) {
    try {
      const result = await db.query(`
        DELETE from users
        WHERE username=$1
        RETURNING username, first_name, last_name, email, photo_url`,
        [username])

      return result.rows[0];
    } catch (err) {
      throw new ExpressError(userNotFound + username, 404);
    }
   }

}

module.exports = User;
