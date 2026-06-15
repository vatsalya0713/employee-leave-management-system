# Employee Leave Management System

A premium, full-stack Employee Leave Management System built with a **Spring Boot 3 REST API** (Java 21) and a **Vite React Frontend** utilizing modern CSS (Glassmorphism & Dark Mode).

---

## 🚀 Features

### 🔐 Authentication & Authorization
* **JWT Authentication**: Secure stateless logins.
* **Role-Based Access Control (RBAC)**: Custom routing and authorization policies for **ADMIN**, **MANAGER**, and **EMPLOYEE** roles.
* **Password Encryption**: Secure credential storage using BCrypt.

### 💼 Employee Management
* Full CRUD capabilities for employee records.
* Paginated dynamic search by name, department, or email.

### 📅 Leave Requests
* **Multi-type Leaves**: CASUAL, SICK, and EARNED leave types.
* **Auto-Calculations**: Auto-computes leave duration in days.
* **Balance Verification**: Restricts requests if duration exceeds available leave balance.
* **Status badging**: PENDING, APPROVED, REJECTED.
* **Cancellation**: Employees can cancel pending applications.

### 👔 Manager Approvals
* Dedicated workflow to review all pending requests.
* Status update with balance deduction on approval, or reject without change.

### 🛡️ Admin Panel
* Modify leave balances manually.
* View global logs of all leaves and employees.
* Delete employee profiles.

### 📧 Email Notifications
* Automatically alerts employees via Spring Mail when a leave is applied, approved, or rejected.

---

## 🛠️ Technology Stack

### Backend
* **Core**: Java 21, Spring Boot 3.3.0
* **Security**: Spring Security, JWT (JJWT 0.12.5)
* **Database**: MySQL, Spring Data JPA
* **Auditing**: JPA Auditing (`createdAt`, `updatedAt`)
* **Utilities**: Lombok, JSR-380 Validation

### Frontend
* **Core**: React 18, Vite
* **Routing**: React Router DOM (v6)
* **API Client**: Axios (configured with request interceptor for JWT injection)
* **Design**: Vanilla CSS with custom scrollbars and responsive CSS grids
* **Icons**: Lucide React

---

## 📁 Directory Structure

```
├── pom.xml
├── src/main/java/com/leavemanagement/
│   ├── LeaveManagementApplication.java
│   ├── config/          # Spring Configs (SecurityConfig, WebConfig)
│   ├── controller/      # API Controllers
│   ├── dto/             # Data Transfer Objects & Validations
│   ├── entity/          # Database Models & Enums
│   ├── exception/       # Custom Exceptions & Global Exception Handler
│   ├── repository/      # Database Repositories
│   ├── security/        # JWT & Security filters
│   └── service/         # Business Logic, Email & User Services
└── frontend/
    ├── src/
    │   ├── App.jsx      # Navigation, Router configuration, Protected routes setup
    │   ├── index.css    # Premium CSS design system (Dark Mode & Glassmorphism)
    │   ├── components/  # ProtectedRoute, Sidebar
    │   ├── context/     # AuthContext (Auth state management)
    │   ├── services/    # api.js (Axios configurations)
    │   └── views/       # Login, Register, Dashboards (Employee, Manager, Admin)
```

---

## 🔌 API Documentation

### Authentication Mappings
* `POST /api/auth/register` - Create user profile (Auto-creates employee details).
* `POST /api/auth/login` - Authenticate user credentials and return JWT.

### Employee Mappings
* `POST /api/employees` - Create profile *(ADMIN only)*.
* `PUT /api/employees/{id}` - Update profile *(ADMIN only)*.
* `GET /api/employees/{id}` - Fetch employee details.
* `GET /api/employees` - Get paginated list of employees.
* `DELETE /api/employees/{id}` - Remove employee profile *(ADMIN only)*.
* `GET /api/employees/search` - Search by name, department, or email.

### Leave Request Mappings
* `POST /api/leaves` - Apply for leave.
* `GET /api/leaves/my-leaves` - View logged-in employee's history.
* `PUT /api/leaves/cancel/{leaveId}` - Cancel a pending request.
* `GET /api/leaves/search` - Search leaves by status or type.

### Manager Mappings *(MANAGER only)*
* `GET /api/manager/pending-leaves` - List pending applications.
* `PUT /api/manager/approve/{leaveId}` - Approve request (Deducts balance).
* `PUT /api/manager/reject/{leaveId}` - Reject request.

### Admin Mappings *(ADMIN only)*
* `GET /api/admin/employees` - Fetch all employees.
* `GET /api/admin/leaves` - View all leave requests.
* `PUT /api/admin/update-balance/{employeeId}` - Set employee leave balance.
* `DELETE /api/admin/delete/{employeeId}` - Delete employee profile.

---

## 🏃 Getting Started

### 1. Database Setup
Ensure MySQL is running. Create a schema named `leave_management_db`:
```sql
CREATE DATABASE leave_management_db;
```
Configure database credentials in [application.yml](file:///Users/vatsalyabhardwaj/Leave-Management-System/src/main/resources/application.yml) if necessary.

### 2. Startup Backend
Navigate to the root directory and run:
```bash
mvn clean compile
mvn spring-boot:run
```
*(Runs on `http://localhost:8080`)*

### 3. Startup Frontend
Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`)*
