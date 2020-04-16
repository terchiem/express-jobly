const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/users");

describe("#users", function () {

  let testUser;

  beforeEach(async function () {
    await db.query("DELETE FROM users");

    testUser = await User.create({
      username: "testuser",
      password: "password",
      first_name: "test",
      last_name: "man",
      email: "a@a.com",
      photo_url: "test photo"
    });
  })

  describe("GET /users route tests", function () {
    test("GET /users should return user data of all users", async function () {
      const response = await request(app).get("/users");

      const { username, first_name, last_name, email } = testUser;

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ users: [{ username, first_name, last_name, email }] });
    })

    test("Searching for a user by username should return all data for that user", async function () {
      const response = await request(app).get(`/users/${testUser.username}`);

      delete testUser.photo_url;

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ user: testUser });

    });

    test("Searching for a user with a nonexistent username should return 404", async function () {
      const response = await request(app).get("/users/invalid");

      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({ status: 404, message: `Cannot find user for invalid` });
    });

  });

  describe("POST /users route tests", async function () {
    let testUser2;

    beforeEach(() => {
      testUser2 = {
        username: "testuser2",
        password: "password",
        first_name: "test",
        last_name: "man",
        email: "b@b.com",
        photo_url: "test photo"
      }
    });
    
    test("POSTing valid user data should create a new user.", async function () {
      const response = await request(app).post("/users").send({ user: testUser2 });
      const dbResult = await db.query('SELECT username FROM users WHERE username=$1', [response.body.user.username]);

      delete testUser2.password;

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ user: testUser2 });
      expect(dbResult.rows).toHaveLength(1);

    });

    test("Prevent creation of user with a duplicate username", async function () {
      testUser2.username = testUser.username;
      const response = await request(app).post("/users").send({ user: testUser2 });

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({ status: 400, message: "Error creating new user." });
    })
  });

  describe("PATCH /users route tests", function () {
    const data = { user: {
      first_name: "updated name",
      photo_url: "updated url"
    }}

    test("PATCH updates user details", async function () {
      const response = await request(app).patch(`/users/${testUser.username}`).send(data);

      expect(response.statusCode).toEqual(200);
      expect(response.body.user.first_name).toEqual("updated name");
      expect(response.body.user.photo_url).toEqual("updated url");

      // confirm changes in the database
      const dbResult = await db.query('SELECT first_name FROM users WHERE username=$1', [testUser.username]);
      expect(dbResult.rows[0].first_name).toEqual("updated name");
    });

    test("Does not update user with invalid data", async function () {
      const response = await request(app).patch(`/users/${testUser.id}`).send({});

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({ "status": 400, "message": ["instance requires property \"user\""] })
    })

    test("Does not update a user that does not exist", async function () {
      const response = await request(app).patch("/users/invalid").send(data);

      expect(response.statusCode).toEqual(404);
    })
  });

  describe("DELETE /users route tests", function () {
    test("Deletes a user", async function () {
      const response = await request(app).delete(`/users/${testUser.username}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "User deleted" });

      // confirm deletion in db
      const dbResult = await db.query(`SELECT username FROM users`);
      expect(dbResult.rows).toHaveLength(0);
    })

    test("Does not delete an invalid user", async function () {
      const response = await request(app).delete("/users/zzzzzz");

      expect(response.statusCode).toEqual(404);
    })

  })





  afterAll(async function () {
    await db.end();
  });
});
