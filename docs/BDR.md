# Business Requirements Document (BRD)
## TeachPilot — Agentic RAG Platform for Curriculum & Assessment Design

**Variant:** Domain D3 (Education — Curriculum & Assessment Design) + Twist T0 (Multi-tenancy)

---

## 1. Context

Instructors in educational institutions spend significant time manually searching through large curriculum and standards documents, and drafting assessment questions that align with specific curriculum content and competency standards. This process is slow, prone to human error, and consumes time that instructors could otherwise spend teaching or supporting students directly.

## 2. Objectives

TeachPilot provides an AI-assisted copilot that:

1. Answers instructor questions from ingested educational documents, with accurate, traceable citations to the source material.
2. Generates draft assessment items (questions + answer keys) based on curriculum content and competency standards, subject to mandatory review and approval by a Lead Instructor before being finalized.
3. Serves multiple educational institutions (tenants) on a single platform, with strict data isolation between them.

### Measurable success criteria (draft — to be refined)

- [ ] Retrieval answers questions with correct citations to source chunks
- [ ] System correctly refuses to answer when there is insufficient evidence in the corpus
- [ ] No instructor can access another tenant's documents, users, or generated content under any circumstance
- [ ] Assessment items cannot be published without explicit Lead Instructor approval

---

## 3. Personas

| Persona | Role Value | Description | Key Needs |
|---|---|---|---|
| **Admin** | `admin` | Manages the institution's account: adds/removes users, oversees institution-wide settings. May be the same physical person as a Lead Instructor in smaller institutions. | Simple user management; visibility into institution activity |
| **Instructor** | `instructor` | Uploads curriculum documents, asks questions of the corpus, requests generated curriculum outlines or draft assessment items. | Fast, cited answers; low-friction document upload; draft generation to save prep time |
| **Lead Instructor** | `lead_instructor` | Has all Instructor capabilities, plus the authority to approve, reject, or edit-and-approve generated assessment items before they are finalized. | Confidence that no item reaches students without review; clear audit trail of decisions |

**Note:** Roles are independent flags on the `User` model, not separate account types — a single person may hold multiple responsibilities in a small institution, while larger institutions can assign roles to different people.

## 4. Requirements

*(to be completed — each requirement will have a unique ID, e.g. BR-01, with acceptance criteria)*

## 5. Out of Scope

*(to be completed)*

## 6. Business Rules

*(to be completed)*

## 7. Assumptions & Risks

*(to be completed)*

## 8. Traceability Matrix

*(to be completed — maps each BR-xx requirement to: implemented / partial / deferred, with evidence)*