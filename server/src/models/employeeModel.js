import db from "../config/db.js";

const columns = ["firstName", "lastName", "email", "phone", "department", "jobTitle", "salary", "joiningDate", "status"];

export const findEmployees = async ({ page, limit, search, department, status, sortBy, sortOrder }) => {
  const allowedSort = {
    firstName: "firstName", lastName: "lastName", email: "email",
    department: "department", salary: "salary", joiningDate: "joiningDate",
    createdAt: "createdAt", status: "status"
  };
  const sortColumn = allowedSort[sortBy] || "createdAt";
  const direction = sortOrder === "ASC" ? "ASC" : "DESC";
  const where = ["isDelete = FALSE"];
  const values = [];

  if (search) {
    where.push("(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR department LIKE ?)");
    const term = `%${search}%`;
    values.push(term, term, term, term);
  }
  if (department) { where.push("department = ?"); values.push(department); }
  if (status) { where.push("status = ?"); values.push(status); }

  const whereSql = where.join(" AND ");
  const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM employees WHERE ${whereSql}`, values);
  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT id, firstName, lastName, email, phone, department, jobTitle, salary, joiningDate, status, createdAt, updatedAt
     FROM employees WHERE ${whereSql} ORDER BY ${sortColumn} ${direction} LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return { rows, total };
};

export const findEmployeeById = async (id) => {
  const [rows] = await db.execute("SELECT * FROM employees WHERE id = ? AND isDelete = FALSE", [id]);
  return rows[0] || null;
};

export const createEmployee = async (employee) => {
  const values = columns.map((column) => employee[column] ?? null);
  const [result] = await db.execute(
    `INSERT INTO employees (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findEmployeeById(result.insertId);
};

export const updateEmployee = async (id, employee) => {
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = [...columns.map((column) => employee[column] ?? null), id];
  const [result] = await db.execute(
    `UPDATE employees SET ${assignments} WHERE id = ? AND isDelete = FALSE`, values
  );
  return result.affectedRows ? findEmployeeById(id) : null;
};

export const softDeleteEmployee = async (id) => {
  const [result] = await db.execute(
    "UPDATE employees SET isDelete = TRUE WHERE id = ? AND isDelete = FALSE", [id]
  );
  return result.affectedRows > 0;
};
