import { useCallback, useEffect, useState } from "react";
import { employeeApi, type EmployeeQuery } from "../api/employeeApi";
import type { Employee } from "../types/employee";

const initialQuery: EmployeeQuery = {
  page: 1, limit: 8, search: "", department: "", status: "", sortBy: "createdAt", sortOrder: "DESC"
};

export function useEmployees() {
  const [query, setQuery] = useState<EmployeeQuery>(initialQuery);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await employeeApi.list(query);
      setEmployees(result.data); setMeta(result.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load employees.");
    } finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void refresh(); }, [refresh]);

  const updateQuery = (patch: Partial<EmployeeQuery>) =>
    setQuery((current) => ({ ...current, ...patch, ...(patch.page === undefined ? { page: 1 } : {}) }));

  return { employees, meta, query, updateQuery, loading, error, refresh };
}
