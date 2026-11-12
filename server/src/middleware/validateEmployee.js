const required = ["firstName", "lastName", "email", "department", "jobTitle", "joiningDate"];

export const validateEmployee = (req, res, next) => {
  const body = req.body || {};
  const missing = required.filter((field) => !String(body[field] ?? "").trim());

  if (missing.length) {
    return res.status(400).json({
      success: false,
      message: `Required fields: ${missing.join(", ")}`
    });
  }

  const email = String(body.email).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address." });
  }

  const phone = String(body.phone ?? "").trim();
  if (phone && !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });
  }

  const salary = Number(body.salary ?? 0);
  if (!Number.isFinite(salary) || salary < 0) {
    return res.status(400).json({ success: false, message: "Salary must be a non-negative number." });
  }

  if (body.status && !["Active", "Inactive"].includes(body.status)) {
    return res.status(400).json({ success: false, message: "Status must be Active or Inactive." });
  }

  next();
};
