# Plagiarism Risk Report — Smart Gym Management System Paper

**Author:** Aryan Suthar | **Institution:** ITM SLS Baroda University

**Analysed By:** AI Plagiarism Risk Advisor

**Date:** March 2026

---

> **Overall Estimated Turnitin/iThenticate Score: 28–40%**
>
> This is above the acceptable academic threshold (typically 15–20%). Immediate attention is required on the sections marked 🔴 HIGH RISK.

---

## Risk Legend

| Symbol | Risk Level      | Estimated Match |
| ------ | --------------- | --------------- |
| 🔴     | High Risk       | 40–55%         |
| 🟡     | Medium Risk     | 25–39%         |
| 🟢     | Low Risk        | <br />10–24%   |
| 🔵     | Safe / Original | 0–9%           |

---

---

# PAGE 1 — Abstract & Introduction

**Estimated Page-Level Flag Rate: ~38%** 🔴

---

## Section: Abstract

**Risk Level:** 🔴 HIGH (Est. ~45% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                          | Reason                                                                |
| - | --------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1 | *"global fitness sector experiences rapid growth"*            | Matches dozens of SaaS/gym market reports verbatim                    |
| 2 | *"vendor lock-in"*and*"limited customization options"*      | Boilerplate open-source advocacy phrases found widely in literature   |
| 3 | *"schema-based multi-tenant architecture"*                    | Lifted directly from SaaS architecture textbooks without paraphrasing |
| 4 | *"95th-percentile API response times under 200 milliseconds"* | If drawn from tool documentation or prior benchmarks, will be flagged |
| 5 | *"zero-cost alternative to expensive proprietary platforms"*  | Common phrasing in open-source software advocacy papers               |

### Suggested Fixes

* ✅ Rewrite the first two sentences from your system's perspective, e.g. *"Smart GMS was designed to address the cost and flexibility barriers prevalent in commercial gym software..."*
* ✅ Anchor performance statistics explicitly as *"empirically measured in this study"* to establish them as original findings
* ✅ Replace *"vendor lock-in"* with a more specific phrase tied to your actual findings, e.g. *"inability to export data or integrate third-party APIs without vendor approval"*
* ✅ Remove or rephrase *"zero-cost alternative"* — replace with *"a self-hosted, open-source solution that eliminates recurring licensing fees"*

---

## Section: Section I — Introduction

**Risk Level:** 🔴 HIGH (Est. ~42% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                                                | Reason                                                              |
| - | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1 | *"USD 87 billion"*market size figure                                                                  | Direct lift from IBISWorld [25] — will match the cited source      |
| 2 | *"swift digital transformation"*                                                                    | Marketing cliché found in hundreds of fitness-tech and SaaS papers |
| 3 | Mindbody critique —*"expensive recurring subscriptions"* ,*"restrict flexible API integrations"* | Mirrors Chong & Carraro [6] almost verbatim                         |
| 4 | *"63% of local fitness entrepreneurs attribute their reluctance to digitize"*                       | Directly from the cited 2022 industry poll — high match risk       |
| 5 | Contribution bullets —*"nested four-tier RBAC"* ,*"sub-15ms message latency"*                    | Standard CS benchmark language                                      |

### Suggested Fixes

* ✅ Restate the IBISWorld stat with attribution framing: *"The fitness software market exceeded USD 87 billion as of 2023, according to recent industry analysis [25]"*
* ✅ Rewrite the Mindbody critique from your own system-design perspective: *"During the requirements phase, we observed that platforms such as Mindbody impose..."*
* ✅ The bullet-point contributions are largely original — keep those, but rewrite the surrounding framing prose
* ✅ Replace *"swift digital transformation"* with a factual observation specific to your research context

---

---

# PAGE 2 — Literature Review (Part 1)

**Estimated Page-Level Flag Rate: ~48%** 🔴

---

## Section: Literature Review — Market Context

**Risk Level:** 🔴 HIGH (Est. ~52% flagged)

> ⚠️ This is the HIGHEST-RISK page in the paper. The market statistics paragraph is likely to be flagged almost in its entirety.

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                                | Reason                                                                     |
| - | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1 | *"Valued at roughly USD 87 billion in 2023... USD 131 billion by 2030 (6.2% CAGR)"* | Near-verbatim copy from IBISWorld [25] — extremely high flag risk         |
| 2 | Zen Planner, Mindbody, GymMaster critique paragraph                                   | Echoes phrasing from Chong & Carraro [6] very closely                      |
| 3 | *"63% of local fitness entrepreneurs attribute their reluctance to digitize"*       | Verbatim from a 2022 industry poll — source must be cited and paraphrased |
| 4 | SaaS pricing model description                                                        | Recycled from [6] — reads as a summary rather than original analysis      |
| 5 | *"detaching the core software license costs from auxiliary hosting fees"*           | Boilerplate open-source advocacy language                                  |

### Suggested Fixes

* ✅ **CRITICAL:** The entire market statistics paragraph must be paraphrased — do not quote consecutive statistics from the same source
* ✅ Add *"according to industry analysis [25]"* and rephrase: *"The global fitness market, which industry data places at approximately USD 87 billion [25], is projected to reach USD 131 billion by 2030..."*
* ✅ The SaaS critique paragraph needs heavy rewriting — it should reflect YOUR analysis of why these models fail YOUR target users, not a restatement of [6]
* ✅ Attribute the 63% statistic with a full citation and rephrase: *"A 2022 industry survey found that nearly two-thirds of independent gym operators cited cost and complexity as barriers to digitisation [cite]"*

---

## Section: Literature Review — UX & Retention Studies

**Risk Level:** 🟡 MEDIUM (Est. ~30% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                      | Reason                                                               |
| - | ------------------------------------------- | -------------------------------------------------------------------- |
| 1 | *"23% boost in 12-month retention rates"* | Cited from [13] but phrasing mirrors the abstract of that paper      |
| 2 | Five UX elements from Sharma et al. [12]    | Listed almost identically to the source paper's own keywords section |
| 3 | *"survival analysis"*method description     | Standard academic phrase — moderate match risk across journals      |

### Suggested Fixes

* ✅ Describe the five UX elements in your own words: *"Sharma et al. [12] identified goal visualisation, gamified progression, social networking, personalised scheduling, and optimised push notifications as..."*
* ✅ Contextualise the 23% figure within your system: *"Research by Chen and Lee [13] demonstrated that direct digital trainer–client communication increased annual retention by 23%, directly motivating our WebSocket module"*

---

## Section: Literature Review — Architecture Choices

**Risk Level:** 🟡 MEDIUM (Est. ~28% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                             | Reason                                                        |
| - | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| 1 | Rodriguez [14] multi-tenancy patterns description                  | Language closely mirrors the cited IEEE paper's abstract      |
| 2 | *"modular monolith"*vs microservices argument                      | Widely repeated phrase in cloud-architecture literature       |
| 3 | *"GDPR mandates, PCI-DSS guidelines, and OWASP recommendations"* | Standard compliance boilerplate found in most security papers |

### Suggested Fixes

* ✅ Reframe Rodriguez: *"Rodriguez [14] evaluated three multi-tenancy strategies and concluded that schema-level isolation best balances performance and privacy for platforms under 500 tenants — a finding directly applicable to Smart GMS's target scale"*
* ✅ The monolith argument is fine — just cite Williams [15] more explicitly and tie it to YOUR user base projections

---

---

# PAGE 3 — System Architecture (Part 1)

**Estimated Page-Level Flag Rate: ~30%** 🟡

---

## Section: Section III-A — High-Level Architecture

**Risk Level:** 🟡 MEDIUM (Est. ~32% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                                    | Reason                                                                     |
| - | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1 | *"Separation of Concerns (SoC) principle"*                                              | Textbook phrase — will flag against multiple software engineering sources |
| 2 | *"ACID-compliant transactions, safeguarding critical financial ledgers"*                | Standard Oracle/database marketing language                                |
| 3 | CAP theorem explanation                                                                   | Closely mirrors Brewer [19]'s original framing                             |
| 4 | *"horizontal scaling... fundamental prerequisite for modern cloud-native environments"* | Verbatim cliché found in cloud-architecture papers                        |

### Suggested Fixes

* ✅ Tie the CAP theorem to YOUR design: *"Smart GMS deliberately prioritises Consistency and Partition Tolerance over Availability — a necessary trade-off given our financial transaction requirements"*
* ✅ Replace *"fundamental prerequisite"* with a specific statement: *"a requirement we validated during load testing at 100 concurrent users"*
* ✅ When using SoC, explain what it means for YOUR codebase specifically

---

## Section: Section III-B — Technology Stack Justification

**Risk Level:** 🟡 MEDIUM (Est. ~35% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                      | Reason                                                                 |
| - | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1 | *"React's Virtual DOM reconciliation engine"*                             | Matches React official documentation language closely                  |
| 2 | *"15–25% reduction in runtime type errors"*                              | Stat from [3] — phrasing may mirror source if not clearly paraphrased |
| 3 | *"Django's Python Global Interpreter Lock (GIL) critically bottlenecked"* | Standard GIL critique found in hundreds of backend comparison articles |
| 4 | *"PostgreSQL... lacked the granular enterprise auditing"*                 | Mirrors Oracle marketing/documentation materials                       |

### Suggested Fixes

* ✅ Frame all comparisons as YOUR evaluation: *"In our evaluation, Django's GIL created measurable bottlenecks during simulated concurrent I/O workloads, leading us to select Spring Boot"*
* ✅ The 15–25% TypeScript stat needs a citation bracket immediately after the number, not at the end of the sentence
* ✅ Oracle selection rationale should be framed around YOUR GDPR compliance requirements, not generic Oracle feature descriptions

---

## Section: Section III-C — Deployment Architecture

**Risk Level:** 🟢 LOW (Est. ~18% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                          | Reason                                                 |
| - | --------------------------------------------------------------- | ------------------------------------------------------ |
| 1 | *"Brotli compression"*and*"HTTP/2 connection multiplexing"* | Standard deployment terminology — low individual risk |
| 2 | *"Time-To-First-Byte (TTFB)"*framing                            | Common in web performance literature                   |

### Suggested Fixes

* ✅ This section is mostly original — ensure CDN choices (Vercel/Netlify) are framed as YOUR selection rationale with brief justification
* ✅ No major rewrites required

---

---

# PAGE 4 — System Architecture (Part 2) & Data Modeling

**Estimated Page-Level Flag Rate: ~25%** 🟡

---

## Section: Backend Connectivity (Section III continued)

**Risk Level:** 🟢 LOW (Est. ~20% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                | Reason                              |
| - | ----------------------------------------------------- | ----------------------------------- |
| 1 | HikariCP connection pooling description               | Mirrors HikariCP GitHub README [17] |
| 2 | Google and Facebook OAuth 2.0 integration description | Standard OAuth boilerplate language |

### Suggested Fixes

* ✅ When describing HikariCP behaviour, add: *"as documented in [17]"* rather than restating it as your own finding
* ✅ OAuth description is fine — briefly note WHY you chose OAuth over session-based auth for YOUR architecture

---

## Section: Section IV-A — Data Flow Modeling

**Risk Level:** 🟢 LOW (Est. ~22% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                       | Reason                                          |
| - | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| 1 | *"DeMarco and Yourdon [22]"*DFD opening sentence                             | Closely echoes DeMarco's own definition of DFDs |
| 2 | *"at-least-once message delivery guarantee required by standard RFC 6455"* | Language directly from the RFC itself           |

### Suggested Fixes

* ✅ Cite RFC 6455 inline when mentioning the delivery guarantee
* ✅ Paraphrase the DFD definition into your system's context: *"Following DeMarco and Yourdon's [22] structured analysis methodology, we modelled Smart GMS using DFDs across two levels of abstraction"*

---

## Section: Section IV-B — Entity-Relationship Modeling

**Risk Level:** 🟡 MEDIUM (Est. ~30% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                           | Reason                                                         |
| - | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1 | *"Third Normal Form (3NF) based on Codd's foundational relational principles"* | Echoes Codd's 1970 paper [23] framing                          |
| 2 | *"eliminating transitive dependencies"*                                        | Textbook database normalization definition — will flag widely |
| 3 | *"maximum cardinality rule, assigning the most selective column first"*        | Oracle indexing documentation language                         |

### Suggested Fixes

* ✅ Attribute 3NF clearly: *"Following Codd's [23] relational model, Smart GMS achieves 3NF by ensuring all non-primary attributes depend exclusively on primary keys, preventing the update anomalies we observed in early schema drafts"*
* ✅ The cardinality rule explanation is fine — add a line showing YOUR specific implementation outcome (e.g. the actual index columns you chose and the measured improvement)

---

## Section: Section IV-C — UML Design

**Risk Level:** 🔵 SAFE (Est. ~15% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                           | Reason                           |
| - | ------------------------------------------------ | -------------------------------- |
| 1 | *"In alignment with OMG standardization [24]"* | Safe — properly cited, low risk |
| 2 | FSM node list                                    | Original to your system          |

### Suggested Fixes

* ✅ **No major changes needed.** This is one of the safest sections in the paper.
* ✅ The FSM and sequence diagram descriptions are original contributions — emphasise these more

---

---

# PAGE 5–6 — Features & Core Algorithms

**Estimated Page-Level Flag Rate: ~28%** 🟡

---

## Section: Section V-A — Authentication & Role Management

**Risk Level:** 🟢 LOW (Est. ~20% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                        | Reason                               |
| - | --------------------------------------------- | ------------------------------------ |
| 1 | *"12 cycles of BCrypt salting and hashing"* | Standard BCrypt documentation phrase |
| 2 | *"time-sensitive One-Time Password (OTP)"*  | TOTP RFC standard language           |

### Suggested Fixes

* ✅ Frame BCrypt as a design decision: *"We selected 12 BCrypt rounds after benchmarking the trade-off between hash computation time and brute-force resistance on our test hardware"*

---

## Section: Section V-B — Membership Lifecycle

**Risk Level:** 🔵 SAFE (Est. ~10% flagged)

### Flagged Phrases & Reasons

* Minimal flag risk — this describes your own CRON logic and custom state machine

### Suggested Fixes

* ✅ **No significant changes needed.** This is original system description.

---

## Section: Section V-C — PT Session & Progress Tracking

**Risk Level:** 🔵 SAFE (Est. ~8% flagged)

### Notes

* Entirely original workflow description — very low plagiarism risk
* The session state machine (Created → Scheduled → In Progress → Complete | No-Show) is original

---

## Section: Section V-D — Real-Time Communication

**Risk Level:** 🟢 LOW (Est. ~15% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                         | Reason                             |
| - | -------------------------------------------------------------- | ---------------------------------- |
| 1 | *"Simple Text Oriented Messaging Protocol (STOMP)"*description | Mirrors Spring STOMP documentation |

### Suggested Fixes

* ✅ Add a citation to Spring STOMP documentation when first introducing STOMP
* ✅ Describe the fallback mechanism (push notifications + email) as YOUR design decision

---

## Section: Section VI — Core Algorithms (RBAC, JWT, Rating, Revenue)

**Risk Level:** 🟡 MEDIUM (Est. ~25% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                  | Reason                                                              |
| - | ------------------------------------------------------- | ------------------------------------------------------------------- |
| 1 | RBAC formula notation (Equation 1)                      | Notation mirrors Ferraiolo et al. [7] exactly                       |
| 2 | JWT formula (Equation 2)                                | HMAC-SHA512 description mirrors RFC 7519 [8] notation               |
| 3 | *"worst-case computational limit rests at O(r × p)"* | Standard complexity analysis phrasing                               |
| 4 | Weighted trainer rating (Equation 3)                    | ✅ APPEARS ORIGINAL — low flag risk                                |
| 5 | Revenue growth rate formula (Equation 4)                | Universal finance formula — will flag against any finance textbook |

### Suggested Fixes

* ✅ Equations 1 & 2 are mathematically standard — the surrounding prose must clearly be YOUR analysis of how they apply, not a restatement of the RFCs
* ✅ **Equation 3 is your most original algorithmic contribution** — emphasise this explicitly in the paper and explain your rationale for the time-decay weight factor of 0.1
* ✅ For Equation 4, note: *"using the standard month-over-month growth rate formula"* and add any relevant citation

---

---

# PAGE 7–8 — Performance Evaluation & Security Analysis

**Estimated Page-Level Flag Rate: ~32%** 🟡

---

## Section: Section VII-A — Theoretical Performance Model

**Risk Level:** 🔴 HIGH (Est. ~40% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                             | Reason                                                                      |
| - | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 1 | *"Little's Law [20], formally defined as L = λW"*               | Explanation mirrors the original paper's framing closely                    |
| 2 | **`pool_size = (C × 2) + D`**                             | ⚠️ Lifted directly from PostgreSQL tuning documentation — NOT attributed |
| 3 | *"default Tomcat 200-thread allocation embedded in Spring Boot"* | Spring Boot documentation language                                          |

### Suggested Fixes

* ✅ **CRITICAL:** The HikariCP pool formula MUST be attributed — it originates from PostgreSQL tuning guidelines, not your own derivation. Add: *"following the pool sizing formula widely recommended in JDBC tuning literature"* with a citation
* ✅ Rewrite Little's Law application: *"Applying Little's Law [20], Smart GMS at 100 concurrent users targeting 150ms response times requires only 15 active threads — comfortably within Tomcat's default 200-thread pool"*

---

## Section: Section VII-B/C/D — Benchmark Results (Tables I & II)

**Risk Level:** 🔵 SAFE (Est. ~5% flagged)

### Notes

* ✅ **Your own empirical data — essentially zero plagiarism risk**
* Tables I & II are the strongest original contribution in the paper
* The p50/p95/p99 latency measurements are unique to your test environment

---

## Section: Section VII-E — Database Performance

**Risk Level:** 🟢 LOW (Est. ~18% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern          | Reason                                             |
| - | ------------------------------- | -------------------------------------------------- |
| 1 | B-tree traversal depth analysis | Standard Oracle/index optimisation language        |
| 2 | *"tenfold optimisation"*result  | Original — tied to your specific benchmark result |

### Suggested Fixes

* ✅ Frame the B-tree analysis as YOUR measurement result: *"After applying composite indexing on (gym_id, status, created_at), our benchmarks showed B-tree traversal depth reduced to ≤3 nodes"*

---

## Section: Section VIII-A — Threat Modeling (STRIDE)

**Risk Level:** 🔴 HIGH (Est. ~44% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                      | Reason                                                              |
| - | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1 | STRIDE acronym expansion                                                    | Directly from Shostack [21] — phrasing nearly identical to source  |
| 2 | *"defense-in-depth mentality"*                                            | OWASP and NIST standard phrase — will flag across multiple sources |
| 3 | *"HSTS flags, strictly whitelisted CORS headers"*                         | Mirrors OWASP Cheat Sheet Series language                           |
| 4 | *"transaction rollbacks, absolute environment-managed secrets shielding"* | Spring Security documentation phrasing                              |

### Suggested Fixes

* ✅ Reframe the entire STRIDE mapping as YOUR threat analysis: *"Applying the STRIDE framework [21] to Smart GMS, we identified the following threat categories and corresponding mitigations..."*
* ✅ Each defence must be described as YOUR implementation decision: *"To counter spoofing threats, we implemented HMAC-SHA512 tokens — a choice driven by [specific reasoning]"*
* ✅ Replace *"defense-in-depth mentality"* with a specific description of your layered security architecture

---

## Section: Section VIII-B — OWASP Table (Table III)

**Risk Level:** 🔴 HIGH — CRITICAL (Est. ~55% flagged)

> ⚠️ **This is the SINGLE HIGHEST-RISK ELEMENT in the entire paper.** It requires immediate revision before submission.

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                                        | Reason                                                                |
| - | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1 | OWASP risk category names (*"Broken Access Control"* , *"Cryptographic Failures"* , etc.) | Exact OWASP category names — will be flagged against owasp.org/Top10 |
| 2 | Risk descriptions in the table                                                                | Near-verbatim from OWASP documentation                                |
| 3 | Control descriptions                                                                          | Closely mirror OWASP Cheat Sheet entries                              |

### Suggested Fixes

* ✅ **CRITICAL:** Rename the second column to *"Smart GMS Implementation"* and describe ONLY YOUR controls in YOUR words
* ✅ Add a table footnote: *"Risk categories sourced from OWASP Top 10 (2021) [11]"* — this attributes the framework properly
* ✅ **Example rewrite:** Instead of *"BCrypt-12 hashing; HMAC-SHA512 JWT; HTTPS enforced"* write *"Passwords are irreversibly hashed using BCrypt with 12 rounds prior to storage; JWTs are signed with HMAC-SHA512 using a 512-bit server secret; all traffic is restricted to HTTPS via TLS 1.3"*
* ✅ Every cell in the control column must be written in your own descriptive words, not lifted from OWASP's documentation

---

## Section: Section VIII-C — Additional Security Controls

**Risk Level:** 🟡 MEDIUM (Est. ~28% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                                                             | Reason                                   |
| - | ---------------------------------------------------------------------------------- | ---------------------------------------- |
| 1 | *"O(2^12) unique cryptographic operations"*                                      | BCrypt documentation framing             |
| 2 | *"is_deleted variable flag"*soft-delete description                                | Found in many Spring/Hibernate tutorials |
| 3 | HTTP header listing (*X-Content-Type-Options* , *X-Frame-Options* , *HSTS* ) | OWASP Cheat Sheet language               |

### Suggested Fixes

* ✅ Frame header configuration as YOUR implementation: *"Smart GMS configures the following HTTP response headers to prevent common browser-based attacks..."*
* ✅ BCrypt complexity argument is acceptable — tie it to YOUR specific round choice and hardware benchmarks

---

---

# PAGE 9–10 — Limitations, Conclusion & References

**Estimated Page-Level Flag Rate: ~15%** 🟢

---

## Section: Section IX — Limitations

**Risk Level:** 🔵 SAFE (Est. ~8% flagged)

### Notes

* ✅ **Entirely original** — describes your prototype's specific constraints
* No significant flag risk
* The seven listed limitations are clearly tied to your specific implementation choices

---

## Section: Section X — Conclusion

**Risk Level:** 🟢 LOW (Est. ~18% flagged)

### Flagged Phrases & Reasons

| # | Flagged Text / Pattern                       | Reason                                                                       |
| - | -------------------------------------------- | ---------------------------------------------------------------------------- |
| 1 | *"sub-200ms request fulfillment"*restatement | Within-paper self-repetition — not plagiarism, but tools flag as repetition |
| 2 | *"profound market viability"*              | Vague marketing phrase found in many SaaS and open-source papers             |

### Suggested Fixes

* ✅ Self-repetition within one paper is NOT plagiarism — tools may flag it as *"self-citation"* at most, which is generally acceptable
* ✅ Replace *"profound market viability"* with a data-backed specific claim: *"our benchmarks confirm that Smart GMS can serve real-world gym workloads at zero licensing cost, presenting a credible alternative for independent operators"*

---

## Section: Section XI — Future Work

**Risk Level:** 🔵 SAFE (Est. ~6% flagged)

### Notes

* Standard forward-looking academic framing — very low risk
* Future work is speculative by nature and rarely flags on plagiarism tools

---

## Section: Section XII — Acknowledgements

**Risk Level:** 🔵 SAFE (Est. ~2% flagged)

### Notes

* Original — no flag risk whatsoever

---

## Section: References

**Risk Level:** 🟢 LOW (Est. ~12% flagged)

### Notes

| # | Note                                                                                                                                |
| - | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Reference lists themselves are not considered plagiarism by Turnitin/iThenticate                                                    |
| 2 | Some reference entries appear to use copy-pasted formatting from Google Scholar — ensure consistent IEEE citation style throughout |
| 3 | DOI and title strings may match database records but this is acceptable and expected                                                |

---

---

# PRIORITY ACTION PLAN

## 🔴 Fix Immediately (Before Any Submission)

| Priority | Location                                   | Action Required                                                     |
| -------- | ------------------------------------------ | ------------------------------------------------------------------- |
| 1        | Table III (Page 8)                         | Rewrite entire "Control Implemented" column in your own words       |
| 2        | Literature Review — Market Stats (Page 2) | Paraphrase the IBISWorld paragraph; add proper attribution framing  |
| 3        | HikariCP pool formula (Page 7)             | Attribute `pool_size = (C×2) + D`to PostgreSQL tuning docs       |
| 4        | STRIDE section (Page 8)                    | Reframe as YOUR threat analysis, not a restatement of Shostack [21] |

## 🟡 Fix Before Final Submission

| Priority | Location                                   | Action Required                                               |
| -------- | ------------------------------------------ | ------------------------------------------------------------- |
| 5        | Introduction — Mindbody critique (Page 1) | Rewrite from your own evaluation perspective                  |
| 6        | Tech stack justification (Page 3)          | Frame all comparisons as YOUR evaluation findings             |
| 7        | 3NF explanation (Page 4)                   | Attribute to Codd [23] with your system-specific outcome      |
| 8        | RBAC/JWT algorithm prose (Page 5–6)       | Ensure surrounding prose is YOUR analysis, not RFC paraphrase |

## 🟢 Low Priority / Optional Improvements

| Priority | Location             | Action Required                                              |
| -------- | -------------------- | ------------------------------------------------------------ |
| 9        | Abstract (Page 1)    | Replace cliché phrases with system-specific language        |
| 10       | Conclusion (Page 10) | Replace*"profound market viability"*with a data-backed claim |
| 11       | References           | Standardise all citations to IEEE format                     |

---

## Original Contributions Worth Highlighting

The following sections are the **most original** parts of your paper and should be emphasised:

* ✅ **Equation 3 — Weighted Trainer Rating Algorithm** — genuinely novel time-decay weighting approach
* ✅ **Tables I & II** — your own empirical benchmark data
* ✅ **Section IX — Limitations** — specific, honest, and original
* ✅ **Section IV-C — UML & FSM Design** — custom state machine for membership lifecycle
* ✅ **Section V-B/C — Membership & PT Workflow** — original system behaviour descriptions

---

*Report generated for academic review purposes only. Estimated scores are approximations based on common plagiarism detection tool behaviour (Turnitin, iThenticate). Actual scores may vary based on tool version, database coverage, and institutional settings.*
