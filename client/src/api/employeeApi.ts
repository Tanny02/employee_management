import http from "./http";
import type { Employee, EmployeeInput, EmployeeListResponse } from "../types/employee";

export interface EmployeeQuery {
  page: number; limit: number; search: string; department: string;
  status: string; sortBy: string; sortOrder: "ASC" | "DESC";
}
export const employeeApi = {
  list: async (params: EmployeeQuery) => (await http.get<EmployeeListResponse>("/employees", { params })).data,
  get: async (id: number) => (await http.get<{ data: Employee }>(`/employees/${id}`)).data.data,
  create: async (payload: EmployeeInput) => (await http.post<{ data: Employee }>("/employees", payload)).data.data,
  update: async (id: number, payload: EmployeeInput) => (await http.put<{ data: Employee }>(`/employees/${id}`, payload)).data.data,
  remove: async (id: number) => (await http.delete(`/employees/${id}`)).data
};
