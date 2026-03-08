# Chapter 3: Overall Experience Gained from the Internship

## 3.1 Reason for Selecting the Organisation

The decision to undertake the internship at [FILL\_IN: ORGANISATION NAME] was motivated by several factors. The organisation's focus on developing practical, real-world software solutions for the fitness industry aligned closely with the author's academic interests in full-stack web development and enterprise application design. The opportunity to work on a greenfield project — one that required designing and building a system from inception — offered significant scope for applying and extending the skills acquired during the BTech programme.

Additionally, the organisation's use of industry-standard technologies, specifically React, Spring Boot, and Oracle Database, presented an opportunity to gain hands-on experience with a modern, enterprise-grade technology stack. The internship also promised exposure to professional software development workflows, including version control, agile sprint management, code reviews, and continuous integration practices.

The author was also drawn to the social significance of the project: by delivering an affordable, open-source alternative to expensive commercial gym management platforms, the system had the potential to benefit smaller fitness businesses that would otherwise be excluded from digital transformation due to cost barriers.

## 3.2 Workflow of the Department

The Software Development Department at [FILL\_IN: ORGANISATION NAME] operated under an Agile Scrum framework. The team structure comprised a Product Owner, a Scrum Master, senior developers, junior developers, and interns. The author joined as an intern developer and collaborated closely with two senior developers throughout the internship.

The weekly workflow adhered to the following schedule:

| Day | Activity |
|-----|----------|
| Monday | Sprint planning / backlog grooming |
| Tuesday – Thursday | Active development, daily stand-ups |
| Friday | Code review, pull request merges, sprint retrospective |

Each sprint produced a working increment of the system, which was deployed to a staging environment for stakeholder review. Features were tracked using GitHub Issues, and the project board was maintained to provide visibility into the status of each task.

The development environment consisted of Visual Studio Code for frontend development, IntelliJ IDEA for backend development, and Docker for local environment management. Postman was used for API testing, and GitHub Actions was configured for continuous integration.

## 3.3 Tasks Allotted During the Internship

The internship tasks were distributed across frontend and backend development, covering all major modules of the Gym Management System. The key tasks undertaken during the internship are summarised below:

### 3.3.1 Frontend Development

The following frontend tasks were completed as part of the internship:

- Designed and implemented the **multi-role dashboard** system, including distinct dashboards for Members, Trainers, Gym Owners, and Super Administrators using React and TypeScript.
- Developed reusable UI components for membership packages, personal training sessions, progress tracking charts, and financial reports using Recharts.
- Implemented the **real-time chat interface** using Socket.io client, integrating WebSocket communication for live message delivery and presence indicators.
- Built the **notification centre** with in-app toast notifications and badge counters, consuming server-sent events from the backend.
- Created responsive CSS layouts for all pages, ensuring compatibility across screen sizes without reliance on CSS frameworks.
- Integrated Axios for all API communication, implementing request/response interceptors for JWT token injection and error handling.

### 3.3.2 Backend Development

The following backend tasks were undertaken:

- Implemented the **authentication and authorisation layer** using Spring Security 6 and JJWT, including JWT generation, validation, and refresh token management.
- Developed the **membership management module**, covering package creation, subscription approval workflows, expiry scheduling, and status transitions.
- Built the **PT session booking system**, enabling members to browse trainer availability, book sessions, and receive WhatsApp-style session confirmations.
- Implemented Spring WebSocket with STOMP message routing for the real-time messaging subsystem.
- Designed and optimised JPA entity relationships and repository queries for the Oracle database, applying lazy loading and index optimisation to achieve sub-200ms API response times.
- Configured role-based method-level security using `@PreAuthorize` annotations to enforce access control at the service layer.

### 3.3.3 Documentation and Testing

- Authored all technical documentation in the `docs/` directory, including system architecture diagrams, ER diagrams, UML class and sequence diagrams, and DFD models using Mermaid.
- Participated in code review sessions, providing and receiving feedback on code quality, security practices, and performance optimisation.
- Wrote unit tests for critical service methods using JUnit 5 and Mockito, achieving test coverage for authentication, membership, and session booking modules.
