# Chapter 3: Overall Experience Gained from the Internship

## 3.1 Reason for Selecting the Organisation

The decision to undertake the internship at Bharti Soft Tech Pvt. Ltd. was motivated by several specific factors. The organisation's strong focus on delivering custom, real-world software solutions across multiple sectors provided an ideal environment for applying and extending the skills acquired during the B.Tech (IT) programme. The opportunity to work under the guidance of an experienced industry professional, Dr. Ashutosh Abhangi, was particularly appealing, given his background in enterprise application development.

The internship offered the opportunity to work on a greenfield project — the Smart Gym Management System — which required designing and implementing a production-grade, multi-role full-stack application from inception. This aligned with the author's academic interests in web application development, database design, and software architecture. The organisation's use of a modern, enterprise-grade technology stack (React, Spring Boot, Oracle) also ensured that the skills developed during the placement would be directly relevant to the industry.

Furthermore, Bharti Soft Tech Pvt. Ltd.'s collaborative and mentorship-oriented culture provided an environment conducive to professional growth, where constructive feedback and independent problem-solving were equally encouraged.

## 3.2 Workflow of the Department

The Software Development Department at Bharti Soft Tech Pvt. Ltd. operated under an Agile Scrum framework. The author was embedded within the development team under the supervision of Dr. Ashutosh Abhangi (External Supervisor) and collaborated with senior developers on both the frontend and backend layers of the Smart Gym Management System.

The weekly workflow followed the structure outlined below:

| Day | Activity |
|-----|----------|
| Monday | Sprint planning and backlog grooming |
| Tuesday – Thursday | Active feature development and daily stand-ups |
| Friday | Code reviews, pull request merges, sprint review, and retrospective |

Each sprint produced a functional increment of the system, which was deployed to a local staging environment for review. Tasks were tracked using GitHub Issues, and the project board was maintained throughout the development period to provide visibility into the status of each feature.

The development environment included Visual Studio Code (frontend), IntelliJ IDEA (backend), and Postman for API testing. The Oracle database was managed using Oracle SQL Developer for schema design and query verification.

## 3.3 Tasks Allotted During the Internship

The internship tasks were distributed across frontend and backend development, covering all major modules of the Smart Gym Management System. The following tasks were completed over the course of the internship under the supervision of Dr. Ashutosh Abhangi:

### 3.3.1 Frontend Development (React + TypeScript)

- Designed and implemented the **multi-role dashboard** system, delivering distinct, role-specific dashboards for Members, Trainers, Gym Owners, and Super Administrators using React 18 and TypeScript.
- Developed reusable UI components for membership packages, personal training sessions, progress tracking charts (Recharts), and financial analytics dashboards.
- Implemented the **real-time chat interface** using Socket.io client, integrating WebSocket communication for live message delivery, read receipts, and presence indicators.
- Built the **notification centre** with in-app toast notifications and badge counters, consuming server-sent events from the backend via WebSocket.
- Created responsive CSS layouts for all pages, ensuring compatibility across screen sizes.
- Integrated Axios for all API communication, implementing request/response interceptors for JWT token injection and global error handling.

### 3.3.2 Backend Development (Spring Boot + Java + Oracle)

- Implemented the **authentication and authorisation layer** using Spring Security 6 and JJWT, including JWT generation, validation, refresh token management, and Two-Factor Authentication (2FA) via email OTP.
- Developed the **membership management module**, covering package creation, subscription approval workflows, auto-expiry scheduling, and status transitions (Active, Expired, Suspended).
- Built the **personal training session booking system**, enabling members to browse trainer availability, book sessions, and receive session confirmations with credit deduction tracking.
- Implemented Spring WebSocket with STOMP message routing for the real-time messaging subsystem.
- Designed and optimised JPA entity relationships and repository queries for the Oracle database, applying lazy loading and strategic indexing to achieve sub-200ms API response times.
- Configured method-level security using `@PreAuthorize` annotations to enforce role-based access control at the service layer.

### 3.3.3 Documentation and Testing

- Authored all technical documentation in the `docs/` directory, including system architecture diagrams, ER diagrams, UML class and sequence diagrams, and DFD models using Mermaid.js.
- Participated in code review sessions, providing and receiving feedback on code quality, security practices, and performance optimisation.
- Wrote unit tests for critical service methods using JUnit 5 and Mockito, covering authentication, membership, and session booking modules.
