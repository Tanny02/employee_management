export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  department: string;
  jobTitle: string;
  salary: number;
  joiningDate: string;
  status: "Active" | "Inactive";
}
export type EmployeeInput = Omit<Employee, "id">;
export interface EmployeeListResponse {
  success: boolean;
  message: string;
  data: Employee[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
