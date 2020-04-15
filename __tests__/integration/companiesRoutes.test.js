const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/companies");



describe("All /companies route tests", function () {

  let testCompany;
  const testSearchTerm = "test";
  const testMinEmployees = 3;

  beforeEach(async function () {
    await db.query("DELETE FROM companies");

    testCompany = await Company.create({
      handle: "test1",
      name: "test1name",
      num_employees: 10,
      description: "Test1 Description",
      logo_url: "http://Test1_logo.com"
    });
  })

  describe("GET /companies route tests", function () {
    test("GET /companies should return handle, name of all companies", async function () {
      const response = await request(app).get("/companies");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ companies: [{ handle: testCompany.handle, name: testCompany.name }] });
    })

    test("Using query paramaters returns name, handle of valid companies", async function () {
      const response = await request(app).get(`/companies?search=${testSearchTerm}&min_employees=${testMinEmployees}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.companies).toEqual([{ handle: testCompany.handle, name: testCompany.name }]);
    });

    test("Searching for a larger min employees than max employees throws error", async function () {
      const response = await request(app).get("/companies?min_employees=2&max_employees=1");

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({ "status": 400, "message": "Min cannot be larger than Max!" });

    })

    test("Searching for a company by handle should return all data for that company", async function () {
      const response = await request(app).get("/companies/test1");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ "company": testCompany });

    });

    test("Searching for a company with a nonexistent handle should return 404", async function () {
      const response = await request(app).get("/companies/xxx");

      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({ "status": 404, "message": `Cannot find company for xxx` });
    });

  });

  describe("POST /companies route tests", async function () {
    const testCompany2 = {
      handle: "test2",
      name: "test2name",
      num_employees: 20,
      description: "Test2 Description",
      logo_url: "http://Test2_logo.com"
    }

    test("POSTing valid company data should create a new company.", async function () {
      const response = await request(app).post("/companies").send({ company: testCompany2 });

      const dbResult = await db.query('SELECT handle FROM companies WHERE handle=$1', [testCompany2.handle]);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ company: testCompany2 });
      expect(dbResult.rows[0]).toEqual({ handle: testCompany2.handle });

    });
  });

});

  afterAll(async function () {
    await db.end();
  });