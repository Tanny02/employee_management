import { useEffect, useState } from "react";
import type { Employee, EmployeeInput } from "../types/employee";
import Dropdown from "./Dropdown";

const departments = ["Engineering", "Design", "Human Resources", "Finance", "Marketing", "Sales", "Operations"];
const departmentOptions = departments.map((value) => ({ label: value, value }));
const blank: EmployeeInput = {
  firstName: "", lastName: "", email: "", phone: "", department: "",
  jobTitle: "", salary: 0, joiningDate: "", status: "Active"
};
type FormErrors = Partial<Record<keyof EmployeeInput, string>>;
interface Props {
  employee: Employee | null;
  onSubmit: (data: EmployeeInput) => Promise<void>;
  onCancel: () => void;
}

function DatePicker({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => value ? new Date(`${value}T12:00:00`) : new Date());
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);
  const selected = value ? new Date(`${value}T12:00:00`) : null;
  const today = new Date();
  const monthLabel = visibleMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const format = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const displayValue = value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Select joining date";

  useEffect(() => {
    if (value) setVisibleMonth(new Date(`${value}T12:00:00`));
  }, [value]);

  return <div className="date-picker-wrap">
    <button type="button" className={`date-picker-trigger ${error ? "has-error" : ""}`} aria-label="Choose joining date" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className={value ? "" : "date-placeholder"}>{displayValue}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
    </button>
    {open && <div className="calendar-popover" role="dialog" aria-label="Choose joining date">
      <div className="calendar-header">
        <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))}>‹</button>
        <strong>{monthLabel}</strong>
        <button type="button" aria-label="Next month" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="calendar-grid calendar-weekdays">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">{cells.map((day, index) => day === null ? <span className="calendar-blank" key={`blank-${index}`} /> : <button type="button" key={day} className={`calendar-day ${selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day ? "selected" : ""} ${today.getFullYear() === year && today.getMonth() === month && today.getDate() === day ? "today" : ""}`} onClick={() => { onChange(format(day)); setOpen(false); }}>{day}</button>)}</div>
      <div className="calendar-footer"><button type="button" onClick={() => { const now = new Date(); onChange(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`); setOpen(false); }}>Today</button><button type="button" onClick={() => setOpen(false)}>Close</button></div>
    </div>}
  </div>;
}

export default function EmployeeForm({ employee, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<EmployeeInput>(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (employee) {
      setForm({
        firstName: employee.firstName, lastName: employee.lastName, email: employee.email,
        phone: employee.phone || "", department: employee.department, jobTitle: employee.jobTitle,
        salary: Number(employee.salary), joiningDate: employee.joiningDate.slice(0, 10), status: employee.status
      });
    } else setForm(blank);
    setErrors({});
    setError("");
  }, [employee]);

  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((current) => ({ ...current, phone: digits }));
      setErrors((current) => ({ ...current, phone: "" }));
      return;
    }
    setForm((current) => ({ ...current, [name]: name === "salary" ? (value === "" ? 0 : Number(value)) : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    else if (form.firstName.trim().length > 80) next.firstName = "Use 80 characters or fewer.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    else if (form.lastName.trim().length > 80) next.lastName = "Use 80 characters or fewer.";
    if (!form.email.trim()) next.email = "Work email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.phone && !/^\d{10}$/.test(form.phone)) next.phone = "Enter a 10-digit phone number.";
    if (!form.department) next.department = "Select a department.";
    if (!form.jobTitle.trim()) next.jobTitle = "Job title is required.";
    if (!Number.isFinite(Number(form.salary)) || Number(form.salary) < 0) next.salary = "Salary cannot be negative.";
    if (!form.joiningDate) next.joiningDate = "Joining date is required.";
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setError("");
    if (Object.values(nextErrors).some(Boolean)) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim().toLowerCase(), jobTitle: form.jobTitle.trim(), phone: form.phone || "" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save employee.");
    } finally { setSaving(false); }
  };

  const fieldClass = (name: keyof EmployeeInput) => errors[name] ? "field-invalid" : "";
  return <form className="employee-form" onSubmit={submit} noValidate>
    <div className="form-heading">
      <div><p className="eyebrow">{employee ? "EMPLOYEE DETAILS" : "NEW TEAM MEMBER"}</p><h2>{employee ? "Edit employee" : "Add an employee"}</h2><p className="form-intro">Keep your team directory up to date.</p></div>
      <button type="button" className="icon-button" onClick={onCancel} aria-label="Close form">×</button>
    </div>
    <div className="form-section-label">EMPLOYEE INFORMATION</div>
    <div className="form-grid">
      <label className={fieldClass("firstName")}>First name *
        <input required maxLength={80} type="text" name="firstName" value={form.firstName} onChange={change} placeholder="e.g. Aditi" aria-invalid={!!errors.firstName} />
        {errors.firstName && <small className="field-error">{errors.firstName}</small>}
      </label>
      <label className={fieldClass("lastName")}>Last name *
        <input required maxLength={80} type="text" name="lastName" value={form.lastName} onChange={change} placeholder="e.g. Sharma" aria-invalid={!!errors.lastName} />
        {errors.lastName && <small className="field-error">{errors.lastName}</small>}
      </label>
      <label className={fieldClass("email")}>Work email *
        <input required maxLength={150} type="email" name="email" value={form.email} onChange={change} placeholder="name@company.com" aria-invalid={!!errors.email} />
        {errors.email && <small className="field-error">{errors.email}</small>}
      </label>
      <label className={fieldClass("phone")}>Phone number
        <input type="tel" name="phone" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={form.phone || ""} onChange={change} placeholder="10-digit mobile number" aria-invalid={!!errors.phone} />
        {errors.phone && <small className="field-error">{errors.phone}</small>}
      </label>
    </div>
    <div className="form-section-label section-spaced">ROLE & EMPLOYMENT</div>
    <div className="form-grid">
      <label className={fieldClass("department")}>Department *
        <Dropdown ariaLabel="Select department" value={form.department} onChange={(value) => { setForm((current) => ({ ...current, department: value })); setErrors((current) => ({ ...current, department: "" })); }} options={departmentOptions} placeholder="Select department" />
        {errors.department && <small className="field-error">{errors.department}</small>}
      </label>
      <label className={fieldClass("jobTitle")}>Job title *
        <input required maxLength={100} type="text" name="jobTitle" value={form.jobTitle} onChange={change} placeholder="e.g. Software Engineer" aria-invalid={!!errors.jobTitle} />
        {errors.jobTitle && <small className="field-error">{errors.jobTitle}</small>}
      </label>
      <label className={fieldClass("salary")}>Annual salary (₹)
        <input type="number" name="salary" value={form.salary} onChange={change} min={0} step="0.01" placeholder="e.g. 450000" aria-invalid={!!errors.salary} />
        {errors.salary && <small className="field-error">{errors.salary}</small>}
      </label>
      <label className={fieldClass("joiningDate")}>Joining date *
        <DatePicker value={form.joiningDate} onChange={(value) => { setForm((current) => ({ ...current, joiningDate: value })); setErrors((current) => ({ ...current, joiningDate: "" })); }} error={errors.joiningDate} />
        {errors.joiningDate && <small className="field-error">{errors.joiningDate}</small>}
      </label>
      <label>Status
        <Dropdown ariaLabel="Employee status" value={form.status} onChange={(value) => setForm((current) => ({ ...current, status: value as "Active" | "Inactive" }))} options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]} />
      </label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancel</button><button className="button primary" disabled={saving}>{saving ? "Saving…" : employee ? "Save changes" : "Add employee"}</button></div>
  </form>;
}
