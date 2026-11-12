import { Router } from "express";
import { getEmployees, getEmployee, addEmployee, editEmployee, deleteEmployee } from "../controllers/employeeController.js";
import { validateEmployee } from "../middleware/validateEmployee.js";

const router = Router();
router.route("/").get(getEmployees).post(validateEmployee, addEmployee);
router.route("/:id").get(getEmployee).put(validateEmployee, editEmployee).delete(deleteEmployee);
export default router;
