const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/users");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, ERROR_MESSAGES: {userNotFound} } = require("../../config");


describe("POST /login", function () {
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

  test("Logging in with the correct credentials returns a token", async function () {
    const response = await request(app).post("/login")
      .send({username: "testuser", password: "password"});

    expect(response.body).toEqual({token: expect.any(String)});

    //verify the token payload
    const payload = jwt.verify(response.body.token, SECRET_KEY);
    expect(payload.username).toEqual(testUser.username)
    expect(payload.is_admin).toBe(false);
  })

  test("Logging in without the correct credentials returns an error", async function () {
    const response = await request(app).post("/login")
      .send({username: "invaliduser", password: "password"});

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ status: 404, message: userNotFound + "invaliduser" });
  })


  afterAll(async function () {
    await db.end();
  });
});