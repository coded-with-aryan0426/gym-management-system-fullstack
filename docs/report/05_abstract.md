# Abstract {.unnumbered}

---

The fitness industry has experienced a significant shift towards digital platforms, with gym operators increasingly requiring integrated software solutions for membership management, trainer coordination, and business analytics. This report presents the design, development, and evaluation of a comprehensive, full-stack Gym Management System developed as part of an internship at [FILL\_IN: Organisation Name].

The system addressed the limitations of existing commercial solutions — particularly their high cost, inflexibility, and lack of real-time communication capabilities — by delivering an open-source, modular platform accessible to gyms of varying sizes. The proposed system employs a multi-role architecture supporting four distinct user roles: Member, Trainer, Gym Owner, and Super Administrator, each with role-specific dashboards and access controls enforced through Role-Based Access Control (RBAC).

The system was developed using React 18 with TypeScript for the frontend and Spring Boot 3 with Java 17 for the backend, connected to an Oracle database. Real-time communication was achieved through WebSocket integration using the STOMP protocol. Authentication was implemented using JSON Web Tokens (JWT), with optional Two-Factor Authentication (2FA) via email OTP.

Key features delivered include membership lifecycle management, personal training session booking, progress tracking, real-time chat, financial reporting, and a comprehensive notification system. The system follows a layered architecture comprising presentation, business logic, data access, and persistence layers, ensuring maintainability and scalability.

Testing was performed at both unit and integration levels. The system met defined performance targets, achieving API response times below 200 milliseconds at the 95th percentile and page load times under three seconds. Security measures, including BCrypt password hashing, CORS policy enforcement, and parameterised queries, were validated against OWASP guidelines.

The internship provided practical experience in full-stack development, agile project management, and professional software engineering practices, bridging the gap between academic theory and industry application.

**Keywords:** Gym Management System, Full-Stack Web Application, React, Spring Boot, Role-Based Access Control, JWT Authentication, WebSocket, Oracle Database.

---
