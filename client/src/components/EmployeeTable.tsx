import { memo } from "react";
import type { Employee } from "../types/employee";

interface Props { employees: Employee[]; onEdit: (employee: Employee) => void; onDelete: (employee: Employee) => void; }
const EmployeeRow = memo(function EmployeeRow({ employee, onEdit, onDelete }: { employee: Employee; onEdit: Props["onEdit"]; onDelete: Props["onDelete"] }) {
  const initials = `${employee.firstName[0] || ""}${employee.lastName[0] || ""}`.toUpperCase();
  return <tr>
    <td><div className="person"><span className="avatar">{initials}</span><span className="person-copy"><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></span></div></td>
    <td><span className="role">{employee.jobTitle}</span></td><td>{employee.department}</td>
    <td>₹{Number(employee.salary).toLocaleString("en-IN")}</td>
    <td><span className={`status ${employee.status.toLowerCase()}`}><i />{employee.status}</span></td>
    <td><div className="row-actions"><button className="edit-action" onClick={() => onEdit(employee)}>Edit</button><button className="delete-action" onClick={() => onDelete(employee)}>Remove</button></div></td>
  </tr>;
});
export default function EmployeeTable({ employees, onEdit, onDelete }: Props) {
  return <div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>ROLE</th><th>DEPARTMENT</th><th>ANNUAL SALARY</th><th>STATUS</th><th><span className="sr-only">ACTIONS</span></th></tr></thead>
    <tbody>{employees.map((employee) => <EmployeeRow key={employee.id} employee={employee} onEdit={onEdit} onDelete={onDelete} />)}</tbody>
  </table></div>;
}
