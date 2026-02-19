# Milestone 2 Report: Online Medication Management System

## Abstract
The **Online Medication Management System** is a comprehensive web-based platform designed to streamline the interaction between patients, doctors, pharmacists, and administrators. The system digitizes the prescription process, enabling secure uploading, verification, and fulfillment of medication orders. By leveraging modern web technologies, the platform ensures data integrity, role-based access control, and a seamless user experience for all stakeholders in the healthcare ecosystem.

## Accomplishments in Milestone 2
In this milestone, we focused on establishing the core architectural pillars and implementing critical workflows:

1.  **Backend Architecture Setup**:
    *   Initialized **Spring Boot** project with a layered architecture (Controller, Service, Repository, Entity).
    *   Configured **MySQL** database integration with Hibernate/JPA for object-relational mapping.
    *   Implemented Global Exception Handling and standardized API responses.

2.  **Authentication & Security**:
    *   Implemented **JWT (JSON Web Token)** based authentication for secure stateless sessions.
    *   Created robust Registration and Login APIs.
    *   Established **Role-Based Access Control (RBAC)** supporting four distinct roles:
        *   **Patient**: Can upload and view prescriptions.
        *   **Doctor**: Can review and approve prescriptions.
        *   **Pharmacist**: Can fulfill verified prescriptions.
        *   **Admin**: Manages users and system settings.

3.  **Frontend Implementation**:
    *   Developed a responsive Single Page Application (SPA) using **Angular**.
    *   Created dedicated **Dashboards** for each user role (Patient, Doctor, Pharmacist, Admin) with distinct visual themes.
    *   Integrated HTTP Interceptors for handling JWT tokens in API requests.

4.  **Prescription Management (Core Feature)**:
    *   Implemented **Prescription Upload** functionality supporting PDF files.
    *   Designed database schemas for `Prescription` and `PrescriptionItem`.
    *   Built APIs for creating, retrieving, and updating prescription status.
    *   Added file storage service to securely handle prescription documents.

## Technology Stack

### Backend
*   **Framework**: Spring Boot 3.2.3
*   **Language**: Java 17
*   **Database**: MySQL 8.0
*   **Security**: Spring Security 6, JSON Web Tokens (JWT)
*   **Build Tool**: Maven

### Frontend
*   **Framework**: Angular
*   **Language**: TypeScript, HTML5, SCSS
*   **Runtime**: Node.js

### Tools & DevOps
*   **Version Control**: Git & GitHub
*   **API Testing**: Postman
*   **IDE**: Visual Studio Code

## Project Summary
The Online Medication Management System is progressing according to schedule. Milestone 2 successfully bridged the gap between the frontend and backend, establishing a secure and functional foundation. Users can now securely register, log in, and access their specific dashboards. The critical core feature—prescription uploading and management—has been implemented on the backend and integrated with the frontend user interface. The system is now ready for the next phase, which will focus on enhancing the prescription workflow (approval/rejection logic), inventory management, and notification systems.
