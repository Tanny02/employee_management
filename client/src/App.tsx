import { useEffect, useMemo, useState } from "react";
import { employeeApi } from "./api/employeeApi";
import Dropdown from "./components/Dropdown";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeTable from "./components/EmployeeTable";
import { useEmployees } from "./hooks/useEmployees";
import type { Employee, EmployeeInput } from "./types/employee";
import "./styles.css";

const departments = ["Engineering","Design","Human Resources","Finance","Marketing","Sales","Operations"];
const departmentOptions = [{label:"All departments",value:""}, ...departments.map((value) => ({label:value,value}))];
const statusOptions = [{label:"All statuses",value:""},{label:"Active",value:"Active"},{label:"Inactive",value:"Inactive"}];
const sortOptions = [
  {label:"Recently added",value:"createdAt:DESC"},
  {label:"Name: A to Z",value:"firstName:ASC"},
  {label:"Salary: high to low",value:"salary:DESC"},
  {label:"Recently joined",value:"joiningDate:DESC"}
];

export default function App() {
  const { employees, meta, query, updateQuery, loading, error, refresh } = useEmployees();
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("employee-theme");
    return saved === "dark" ? "dark" : "light";
  });
  const activeCount = useMemo(() => employees.filter((employee) => employee.status === "Active").length, [employees]);
  const departmentCount = useMemo(() => new Set(employees.map((employee) => employee.department)).size, [employees]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("employee-theme", theme);
  }, [theme]);

  const save = async (payload: EmployeeInput) => {
    if (editing) await employeeApi.update(editing.id, payload);
    else await employeeApi.create(payload);
    setShowForm(false); setEditing(null);
    setNotice(editing ? "Employee details updated." : "Employee added to your directory.");
    await refresh();
  };
  const remove = async (employee: Employee) => {
    if (!window.confirm(`Move ${employee.firstName} ${employee.lastName} out of the active directory? Their record will be retained.`)) return;
    try { await employeeApi.remove(employee.id); setNotice("Employee removed from the active directory."); await refresh(); }
    catch (err: any) { setNotice(err.response?.data?.message || "Delete failed. Please try again."); }
  };
  const edit = (employee: Employee) => { setEditing(employee); setShowForm(true); };
  const changeSort = (value: string) => {
    const [sortBy, sortOrder] = value.split(":");
    updateQuery({ sortBy, sortOrder: sortOrder as "ASC" | "DESC" });
  };

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="Employees home"><span className="brand-symbol"><span /></span><span>employees<span className="brand-dot">.</span></span></a>
      <div className="topbar-right">
        <span className="workspace-label">TEAM DIRECTORY</span>
        <button className="theme-toggle" onClick={() => setTheme((current) => current === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <svg viewBox="0 0 24 24"><path d="M20.2 15.1A8.4 8.4 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"/></svg> : <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>}
        </button>
      </div>
    </header>

    <main className="page">
      <div className="page-intro">
        <div><h1>Employees</h1><p className="subtitle">View and manage employee records.</p></div>
        <button className="button primary add-button" onClick={() => { setEditing(null); setShowForm(true); }}><span className="plus">＋</span> Add employee</button>
      </div>

      <section className="directory-card">
        <div className="directory-heading"><div><h2>Employee directory</h2><p>Search, filter and manage employee records.</p></div><span className="record-count">{meta.total} {meta.total === 1 ? "employee" : "employees"}</span></div>
        <div className="toolbar">
          <div className="search-wrap"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input aria-label="Search employees" placeholder="Search by name, email or department" value={query.search} onChange={(e) => updateQuery({ search: e.target.value })} /><kbd>⌕</kbd></div>
          <div className="filters">
            <Dropdown ariaLabel="Filter by department" value={query.department} onChange={(value) => updateQuery({ department: value })} options={departmentOptions} />
            <Dropdown ariaLabel="Filter by status" value={query.status} onChange={(value) => updateQuery({ status: value })} options={statusOptions} />
            <Dropdown ariaLabel="Sort employees" value={`${query.sortBy}:${query.sortOrder}`} onChange={changeSort} options={sortOptions} />
          </div>
        </div>
        {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
        {error && <p className="form-error">{error}</p>}
        {loading ? <div className="empty-state"><span className="loader" />Loading your directory…</div> : employees.length ? <EmployeeTable employees={employees} onEdit={edit} onDelete={remove} /> : <div className="empty-state"><button className="empty-illustration" type="button" aria-label="Add employee" title="Add employee" onClick={() => { setEditing(null); setShowForm(true); }}>＋</button><strong>No employees found</strong><span>Try another search or add an employee to your directory.</span><button className="button secondary" onClick={() => { updateQuery({ search:"", department:"", status:"" }); }}>Clear filters</button></div>}
        <div className="pagination"><span>Showing <strong>{meta.total ? (meta.page - 1) * meta.limit + 1 : 0}–{Math.min(meta.page * meta.limit, meta.total)}</strong> of <strong>{meta.total}</strong></span><div><button disabled={meta.page <= 1} onClick={() => updateQuery({ page: meta.page - 1 })}>← Previous</button><span className="page-number">{meta.page} / {Math.max(1, meta.totalPages)}</span><button disabled={meta.page >= meta.totalPages} onClick={() => updateQuery({ page: meta.page + 1 })}>Next →</button></div></div>
      </section>
      <footer className="page-footer"><span>Employee management</span><span>EMPLOYEE DIRECTORY</span></footer>
    </main>
    {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><div className="modal"><EmployeeForm employee={editing} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} /></div></div>}
  </div>;
}
