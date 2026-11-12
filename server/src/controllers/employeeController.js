import * as Employee from "../models/employeeModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";

export const getEmployees = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const { rows, total } = await Employee.findEmployees({
    page, limit,
    search: String(req.query.search || "").trim(),
    department: String(req.query.department || "").trim(),
    status: String(req.query.status || "").trim(),
    sortBy: String(req.query.sortBy || "createdAt"),
    sortOrder: String(req.query.sortOrder || "DESC").toUpperCase()
  });
  successResponse(res, {
    message: "Employees fetched successfully",
    data: rows,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

export const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findEmployeeById(req.params.id);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
  successResponse(res, { data: employee });
});

export const addEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.createEmployee(req.body);
  successResponse(res, { statusCode: 201, message: "Employee created successfully", data: employee });
});

export const editEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.updateEmployee(req.params.id, req.body);
  if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });
  successResponse(res, { message: "Employee updated successfully", data: employee });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const deleted = await Employee.softDeleteEmployee(req.params.id);
  if (!deleted) return res.status(404).json({ success: false, message: "Employee not found." });
  successResponse(res, { message: "Employee soft-deleted successfully", data: { id: Number(req.params.id), isDelete: true } });
});
