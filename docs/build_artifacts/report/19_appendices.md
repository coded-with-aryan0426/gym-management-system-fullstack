# Appendices

## Appendix A: System Installation Guide {.unnumbered}

### A.1 Prerequisites

The following tools must be installed before setting up the Gym Management System locally:

\begin{tabular}{@{} p{4.5cm} p{2.5cm} p{\dimexpr\linewidth-4.5cm-2.5cm-4\tabcolsep} @{}}
\toprule
\textbf{Tool} & \textbf{Min. Version} & \textbf{Purpose} \\
\midrule
Node.js      & 18.x  & Frontend runtime \\[3pt]
npm          & 9.x   & Package manager \\[3pt]
Java JDK     & 17+   & Backend runtime \\[3pt]
Maven        & 3.8+  & Java build tool \\[3pt]
Oracle Database & 19c+ & Primary data store \\[3pt]
Git          & 2.x   & Version control \\
\bottomrule
\end{tabular}

### A.2 Frontend Setup

```bash
# Clone repository
git clone https://github.com/coded-with-aryan0426/gym-management-system-fullstack.git
cd gym-management-system-fullstack/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API base URL

# Start development server
npm run dev
```

The frontend development server starts on `http://localhost:5173` by default.

### A.3 Backend Setup

```bash
# Navigate to backend directory
cd gym-management-system-fullstack/backend

# Configure database in application.properties:
# spring.datasource.url=jdbc:oracle:thin:@localhost:1521:orcl
# spring.datasource.username=YOUR_DB_USERNAME
# spring.datasource.password=YOUR_DB_PASSWORD

# Build and run
./mvnw spring-boot:run
```

The backend API server starts on `http://localhost:8080` by default.

### A.4 Environment Variables Reference

\begin{tabular}{@{} p{4.5cm} p{4.0cm} p{\dimexpr\linewidth-4.5cm-4.0cm-4\tabcolsep} @{}}
\toprule
\textbf{Variable} & \textbf{Description} & \textbf{Example} \\
\midrule
\texttt{VITE\_API\_BASE\_URL} & Backend API URL & \texttt{http://localhost:8080/api} \\[3pt]
\texttt{VITE\_WS\_URL} & WebSocket server URL & \texttt{ws://localhost:8080/ws} \\[3pt]
\texttt{spring.datasource.url} & JDBC connection string & \texttt{jdbc:oracle:thin:@...} \\[3pt]
\texttt{jwt.secret} & JWT signing secret (min 256-bit) & \texttt{[secure-random-string]} \\[3pt]
\texttt{spring.mail.host} & SMTP host for email OTP & \texttt{smtp.gmail.com} \\
\bottomrule
\end{tabular}

\medskip\noindent\rule{\textwidth}{0.4pt}\medskip

## Appendix B: Database Schema Reference {.unnumbered}

### B.1 Core Tables Summary

\begin{tabular}{@{} p{4.5cm} p{3.0cm} p{\dimexpr\linewidth-4.5cm-3.0cm-4\tabcolsep} @{}}
\toprule
\textbf{Table Name} & \textbf{Primary Key} & \textbf{Description} \\
\midrule
\texttt{users}              & \texttt{user\_id}         & All user accounts across roles \\[3pt]
\texttt{roles}              & \texttt{role\_id}         & Role definitions (MEMBER, TRAINER, OWNER, ADMIN) \\[3pt]
\texttt{gyms}               & \texttt{gym\_id}          & Gym tenant records \\[3pt]
\texttt{memberships}        & \texttt{membership\_id}   & Active and historical memberships \\[3pt]
\texttt{membership\_packages} & \texttt{package\_id}   & Configured membership packages \\[3pt]
\texttt{pt\_sessions}       & \texttt{session\_id}      & Personal training session bookings \\[3pt]
\texttt{trainer\_details}   & \texttt{trainer\_id}      & Trainer profile extensions \\[3pt]
\texttt{conversations}      & \texttt{conversation\_id} & Chat conversation threads \\[3pt]
\texttt{messages}           & \texttt{message\_id}      & Individual chat messages \\[3pt]
\texttt{notifications}      & \texttt{notification\_id} & System notifications \\
\bottomrule
\end{tabular}

### B.2 Key Relationships

- Each `users` record is associated with one or more `roles` via a join table.
- Each `gym` has exactly one `owner` (foreign key to `users`).
- Each `membership` references one `membership_package` and one `user`.
- Each `pt_session` references one trainer `user`, one member `user`, and belongs to one `gym`.
- Each `conversation` contains zero or more `messages`, and involves two or more `users`.

\medskip\noindent\rule{\textwidth}{0.4pt}\medskip

## Appendix C: API Endpoints Reference {.unnumbered}

### C.1 Authentication Endpoints

\begin{tabular}{@{} p{1.5cm} p{5.5cm} p{\dimexpr\linewidth-1.5cm-5.5cm-4\tabcolsep} @{}}
\toprule
\textbf{Method} & \textbf{Endpoint} & \textbf{Description} \\
\midrule
POST & \texttt{/api/auth/register}    & Register a new user \\[3pt]
POST & \texttt{/api/auth/login}       & Authenticate and receive JWT \\[3pt]
POST & \texttt{/api/auth/refresh}     & Refresh expired JWT \\[3pt]
POST & \texttt{/api/auth/logout}      & Invalidate session \\[3pt]
POST & \texttt{/api/auth/verify-otp}  & Verify 2FA OTP \\
\bottomrule
\end{tabular}

### C.2 Membership Endpoints

\begin{tabular}{@{} p{1.5cm} p{5.5cm} p{\dimexpr\linewidth-1.5cm-5.5cm-4\tabcolsep} @{}}
\toprule
\textbf{Method} & \textbf{Endpoint} & \textbf{Description} \\
\midrule
GET & \texttt{/api/memberships/packages}       & List available packages \\[3pt]
POST & \texttt{/api/memberships/request}       & Submit membership purchase request \\[3pt]
PUT & \texttt{/api/memberships/\{id\}/approve} & Owner approves membership \\[3pt]
PUT & \texttt{/api/memberships/\{id\}/reject}  & Owner rejects membership \\[3pt]
GET & \texttt{/api/memberships/my}             & Get current member's membership \\
\bottomrule
\end{tabular}

### C.3 PT Session Endpoints

\begin{tabular}{@{} p{1.5cm} p{5.5cm} p{\dimexpr\linewidth-1.5cm-5.5cm-4\tabcolsep} @{}}
\toprule
\textbf{Method} & \textbf{Endpoint} & \textbf{Description} \\
\midrule
GET  & \texttt{/api/sessions/trainers}         & Browse available trainers \\[3pt]
POST & \texttt{/api/sessions/book}             & Book a PT session \\[3pt]
PUT  & \texttt{/api/sessions/\{id\}/complete}  & Mark session as complete \\[3pt]
PUT  & \texttt{/api/sessions/\{id\}/cancel}    & Cancel a booked session \\[3pt]
POST & \texttt{/api/sessions/\{id\}/rate}      & Submit session rating \\
\bottomrule
\end{tabular}

\medskip\noindent\rule{\textwidth}{0.4pt}\medskip

## Appendix D: Technology Dependencies {.unnumbered}

### D.1 Frontend Dependencies (Selected)

\begin{tabular}{@{} p{4.5cm} p{2.0cm} p{\dimexpr\linewidth-4.5cm-2.0cm-4\tabcolsep} @{}}
\toprule
\textbf{Package} & \textbf{Version} & \textbf{Licence} \\
\midrule
react              & 18.x   & MIT \\[3pt]
react-dom          & 18.x   & MIT \\[3pt]
react-router-dom   & 6.x    & MIT \\[3pt]
axios              & 1.x    & MIT \\[3pt]
socket.io-client   & 4.x    & MIT \\[3pt]
framer-motion      & 10.x   & MIT \\[3pt]
recharts           & 2.x    & MIT \\[3pt]
lucide-react       & latest & ISC \\[3pt]
typescript         & 5.x    & Apache-2.0 \\[3pt]
vite               & 5.x    & MIT \\
\bottomrule
\end{tabular}

### D.2 Backend Dependencies (Selected)

\begin{tabular}{@{} p{6.5cm} p{2.0cm} p{\dimexpr\linewidth-6.5cm-2.0cm-4\tabcolsep} @{}}
\toprule
\textbf{Package} & \textbf{Version} & \textbf{Licence} \\
\midrule
spring-boot-starter-web       & 3.x    & Apache-2.0 \\[3pt]
spring-boot-starter-security  & 3.x    & Apache-2.0 \\[3pt]
spring-boot-starter-data-jpa  & 3.x    & Apache-2.0 \\[3pt]
spring-boot-starter-websocket & 3.x    & Apache-2.0 \\[3pt]
jjwt-api                      & 0.11.x & Apache-2.0 \\[3pt]
lombok                        & 1.18.x & MIT \\[3pt]
ojdbc8                        & 21.x   & Oracle \\[3pt]
spring-boot-starter-mail      & 3.x    & Apache-2.0 \\
\bottomrule
\end{tabular}
