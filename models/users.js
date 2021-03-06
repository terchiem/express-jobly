const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate")
const bcrypt = require("bcrypt");
const { ERROR_MESSAGES:{ userCreate, userNotFound }, BCRYPT_WORK_FACTOR } = require("../config");


class User {

  /** Takes a username and plaintext password.
   * Retrieves hashed password of supplied username.
   * Uses Bcrypt to compare hashed password and supplied password.
   * Returns true if they match, false otherwise. 
   */
  
  static async authenticate(username, password) {
    const results = await db.query(`
      SELECT password, is_admin 
      FROM users
      WHERE username = $1`,
      [username]);
    
      if (!results.rows.length) throw new ExpressError(userNotFound + username, 404);
    
    const hashedPassword = results.rows[0].password;
    const is_admin = results.rows[0].is_admin;
    
    return {valid: await bcrypt.compare(password, hashedPassword), is_admin}; 

  }

  
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
      throw new ExpressError(userNotFound + username, 404);
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
        RETURNING username, first_name, last_name, email, photo_url, is_admin`,
      [username, hashedPassword, first_name, last_name, email, photo_url]);

    return result.rows[0];
    } catch(err){
      throw new ExpressError(userCreate, 400);
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
      const returnValues = [
        "username", "first_name", "last_name", "email", "photo_url"
      ];

      const sql = sqlForPartialUpdate("users", items, "username", username, returnValues);
      const result = await db.query(sql.query, sql.values);

      const updatedUser = result.rows[0];

      delete updatedUser.password;
      delete updatedUser.is_admin;

      return updatedUser;
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
    const result = await db.query(`
        DELETE from users
        WHERE username=$1
        RETURNING username, first_name, last_name, email, photo_url`,
        [username])

    if (result.rows.length === 0) {
      throw new ExpressError(userNotFound + username, 404);
    }
    
    return result.rows[0];
  }
}

module.exports = User;
