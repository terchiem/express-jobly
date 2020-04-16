const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/companies");
const Job = require("../../models/jobs");



describe("All /jobs route tests", function () {

  let testCompany, testJob;
  const testSearchTerm = "test";
  const testMinSalary = 500;

  beforeEach(async function () {
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM jobs");

    testCompany = await Company.create({
      handle: "test1",
      name: "test1name",
      num_employees: 10,
      description: "Test1 Description",
      logo_url: "http://Test1_logo.com"
    });

    testJob = await Job.create({
      title: "test", 
      salary: 1000, 
      equity: 0.5, 
      company_handle: "test1"
    });
  })

  describe("GET /jobs route tests", function () {
    test("GET /jobs should return title, company_handle of all jobs", async function () {
      const response = await request(app).get("/jobs");

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ jobs: [{ title: testJob.title, company_handle: testJob.company_handle }] });
    })

    test("Using query paramaters returns title, company_handle of valid jobs", async function () {
      const response = await request(app).get(`/jobs?search=${testSearchTerm}&min_salary=${testMinSalary}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.jobs).toEqual([{ title: testJob.title, company_handle: testJob.company_handle }]);
    });

    test("Searching for a min equity greater than 1 throws an error", async function () {
      const response = await request(app).get("/jobs?min_equity=2");

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({ status: 400, message: "Min equity cannot be greater than 1" });

    })

    test("Searching for a job by id should return all data for that job", async function () {
      const response = await request(app).get(`/jobs/${testJob.id}`);

      testJob.company = testCompany;
      testJob.date_posted = testJob.date_posted.toJSON();
      
      delete testJob.id;
      delete testJob.company_handle;

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ job: testJob });

    });

    test("Searching for a job with a nonexistent id should return 404", async function () {
      const response = await request(app).get("/jobs/0");

      expect(response.statusCode).toEqual(404);
      expect(response.body).toEqual({ status: 404, message: `Cannot find job with id 0` });
    });

  });

  describe("POST /jobs route tests", async function () {
    const testJob2 = {
      title: "test2", 
      salary: 2000, 
      equity: 0.8, 
      company_handle: "test1"
    }

    test("POSTing valid job data should create a new job.", async function () {
      const response = await request(app).post("/jobs").send({ job: testJob2 });

      const dbResult = await db.query('SELECT id, date_posted FROM jobs WHERE id=$1', [response.body.job.id]);
      
      delete response.body.job.date_posted;
      delete response.body.job.id;
      
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ job: testJob2 });
      expect(dbResult.rows).toHaveLength(1);

    });

    test("Prevent creation of job with an invalid company handle", async function () {
      testJob2.company_handle = "invalid";
      const response = await request(app).post("/jobs").send({ job: testJob2 });

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({ status: 400, message: "Error creating new job." });
    })
  });

  describe("PATCH /jobs route tests", function () {
    const data = { job: {
      title: "updated title",
      salary: 999
    }}

    test("PATCH updates job details", async function () {
      const response = await request(app).patch(`/jobs/${testJob.id}`).send(data);

      expect(response.statusCode).toEqual(200);
      expect(response.body.job.title).toEqual("updated title");
      expect(response.body.job.salary).toEqual(999);

      // confirm changes in the database
      const dbResult = await db.query('SELECT title FROM jobs WHERE id=$1', [testJob.id]);
      expect(dbResult.rows[0].title).toEqual("updated title");
    });

    test("Does not update job with invalid data", async function () {
      const response = await request(app).patch(`/jobs/${testJob.id}`).send({});

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({ "status": 400, "message": ["instance requires property \"job\""] })
    })

    test("Does not update a job that does not exist", async function () {
      const response = await request(app).patch("/jobs/zzzz").send(data);

      expect(response.statusCode).toEqual(404);
    })
  });

  describe("DELETE /jobs route tests", function () {
    test("Deletes a job", async function () {
      const response = await request(app).delete(`/jobs/${testJob.id}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "Job deleted" });

      // confirm deletion in db
      const dbResult = await db.query(`SELECT id FROM jobs`);
      expect(dbResult.rows).toHaveLength(0);
    })

    test("Does not delete an invalid job", async function () {
      const response = await request(app).delete("/jobs/zzzzzz");

      expect(response.statusCode).toEqual(404);
    })

  })





  afterAll(async function () {
    await db.end();
  });
});
