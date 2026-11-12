CREATE DATABASE IF NOT EXISTS employee_management;
USE employee_management;

CREATE TABLE IF NOT EXISTS employees (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  firstName VARCHAR(80) NOT NULL,
  lastName VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(25) NULL,
  department VARCHAR(80) NOT NULL,
  jobTitle VARCHAR(100) NOT NULL,
  salary DECIMAL(12, 2) NOT NULL DEFAULT 0,
  joiningDate DATE NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  isDelete BOOLEAN NOT NULL DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_email (email),
  INDEX idx_employees_deleted (isDelete),
  INDEX idx_employees_department (department),
  INDEX idx_employees_status (status)
);
