const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe("partialUpdate()", () => {

  const TEST_TABLE = "test";
  const TEST_KEY = "id";
  const TEST_ID = 1;

  it("should generate a proper partial update query with just 1 field",
    function () {

      const sql = sqlForPartialUpdate(TEST_TABLE, {"name": "updated name"}, TEST_KEY, TEST_ID);

      expect(sql.query).toBe(`UPDATE ${TEST_TABLE} SET name=$1 WHERE ${TEST_KEY}=$2 RETURNING *`);
      expect(sql.values).toEqual(["updated name", TEST_ID]);

    });


  it("should generate proper query for set of fields", function () {
    const sql = sqlForPartialUpdate(TEST_TABLE,
      { name: "test",
        password: "password",
        email: "email"
      }, TEST_KEY, TEST_ID);

    expect(sql.query).toBe(`UPDATE ${TEST_TABLE} SET name=$1, password=$2, email=$3 WHERE ${TEST_KEY}=$4 RETURNING *`);
    expect(sql.values).toEqual(["test", "password", "email", TEST_ID]);
  });


  it("should exclude keys that start with '_'", function () {
    const sql = sqlForPartialUpdate(TEST_TABLE,
      {
        name: "name",
        _password: "password"
      }, TEST_KEY, TEST_ID);

    expect(sql.query).toBe(`UPDATE ${TEST_TABLE} SET name=$1 WHERE ${TEST_KEY}=$2 RETURNING *`);
    expect(sql.values).not.toContain("password");
  })

});
