# Wealth Sketch Technology Stack Recommendation

## Executive recommendation

Build Wealth Sketch as a secure, mobile-first financial platform for individuals and savings groups, with an administrator web dashboard. For the first release, use a **modular monolith** backed by PostgreSQL and integrate M-Pesa through a payment adapter. This keeps the MVP understandable and economical while preserving clear boundaries for future scaling.

Do not begin with microservices or Kubernetes. Add those only when measured traffic, team ownership, or independent deployment needs justify the operational cost.

## Recommended stack

| Layer | Recommendation | Why |
|---|---|---|
| Member mobile app | **Flutter (Dart)** for Android and iOS | One mobile codebase and a consistent interface across supported devices. Design for low bandwidth and modest devices. |
| Admin and organization dashboard | **Next.js, React, TypeScript, Tailwind CSS** | A responsive web experience for group administration, reports, approvals, and audit history. |
| Backend API | **NestJS, Node.js, TypeScript**, using REST and an OpenAPI contract | A structured, typed backend suits the core member, group, contribution, loan, approval, and reporting workflows. Start as a modular monolith. |
| Primary data store | **Managed PostgreSQL** | Transactional consistency and relational constraints suit financial records and reporting. |
| Cache and background work | **Redis** for short-lived cache and rate limits; a managed queue such as **Amazon SQS** for durable asynchronous jobs | Keep transient performance data and retryable work out of the financial source of truth. |
| Payments | **Safaricom Daraja API**, behind a provider-independent payment adapter | Supports an initial M-Pesa integration while keeping payment-provider details out of core business logic. |
| Notifications | **Africa's Talking** for SMS; **Firebase Cloud Messaging** for push; **Amazon SES** for email | Covers transaction alerts, reminders, mobile notifications, and formal reports. |
| Cloud and runtime | **AWS managed services**; Docker containers on **ECS/Fargate** | Managed services reduce infrastructure operations for an early team. Reassess region and service choices against latency, residency, availability, and cost requirements. |
| Delivery and operations | **GitHub Actions**, infrastructure as code (for example, Terraform), centralized logs, metrics, alerts, and managed secrets | Repeatable releases and observable production behavior are important for a financial product. |

### Keep analytics proportional to the product stage

Implement the first Financial Discipline Engine as a well-tested backend module that uses auditable group and transaction data. Add a separate **Python/FastAPI** analytics service only when there is a concrete need for Python-specific data science or independently scaled workloads. Do not introduce a second backend stack just for the MVP.

## Core architecture and data safeguards

### Financial records

- Treat PostgreSQL as the authoritative record for balances and financial activity; Redis and client devices must never be authoritative.
- Record money movements as balanced, append-only ledger entries. Derive balances from ledger activity or maintain transactionally updated balance views with reconciliation checks.
- Use database transactions and constraints for related financial changes. Define currency and amount precision explicitly; never use floating-point values for money.
- Make payment initiation and callback processing idempotent. Store provider references and processing states, reconcile pending or ambiguous outcomes, and design background jobs to tolerate retries.
- Keep an auditable history of approvals and administrative changes. Restrict edits to posted financial records; use correcting or reversing entries instead.

### Tenant isolation and access

- Scope every group-owned record and query to its group. Enforce authorization on the server for each operation; hiding a control in the UI is not access control.
- Define roles and permissions for members, group administrators, finance approvers, and Wealth Sketch support. Require stronger authentication for privileged access.
- Minimize collection of personal data and limit staff access to it. Define retention, export, deletion, and incident-response procedures with Kenyan legal and compliance advice.

### Payments and regulatory boundaries

- Put Daraja and any later bank or aggregator integrations behind a payment-provider interface so that business workflows do not depend on provider-specific payloads.
- Verify payment outcomes using provider references and status/reconciliation flows; do not treat a client response or an unverified callback as proof of payment.
- Show applicable fees and transaction status clearly before and after payment. Protect credentials and payment-provider secrets with managed secret storage.
- Use appropriately licensed payment and financial-service partners, and obtain Kenyan legal and regulatory advice before offering regulated services, holding funds, or launching an investment marketplace. A technology stack alone does not establish regulatory compliance.

### Security and reliability

- Require TLS for network traffic and encryption at rest using cloud-managed keys. Limit access to keys and sensitive records by least privilege; encryption settings alone do not establish compliance.
- Apply rate limits, input validation, secure session handling, administrator MFA, dependency updates, and security event logging.
- Separate development, test, and production environments. Keep secrets out of source control and use reviewed, repeatable deployment processes.
- Back up the database, set recovery objectives, and regularly test restoration and reconciliation. Monitor payment failures, queue backlogs, API errors, and unusual access patterns.
- Assess data residency, cross-border transfers, availability, and recovery arrangements against the Kenya Data Protection Act and applicable financial-sector requirements with qualified counsel.

## Phased delivery

1. **Foundation:** establish identity and group boundaries, environments, access controls, database migrations, audit events, monitoring, backups, and a ledger design review.
2. **Chama operating system MVP:** deliver groups and members, contributions, loans, expenses, approvals, reports, and notifications. Start with a reliable admin experience and a mobile-first member experience.
3. **M-Pesa and reconciliation:** add Daraja payment flows, idempotent callback handling, status checks, exception handling, and operational reconciliation before broad rollout.
4. **Expansion and financial intelligence:** add bank or aggregator integrations where justified, richer reporting, and the Financial Discipline Engine. Validate analytics outputs and explain how they are calculated.
5. **Investment marketplace:** consider discovery and comparison of products from regulated providers only after the commercial model, partner responsibilities, and required legal approvals are established.

## Scaling path

Keep clear modules and interfaces around identity, groups, ledger, payments, notifications, and analytics. Scale the API and workers horizontally as needed, and move a module into a separate service only when production evidence supports the added complexity. Prefer managed PostgreSQL, queues, and container hosting before adopting Kubernetes.

## Assumptions and source note

This recommendation uses **Wealth Sketch** as the product name and treats the Chama operating system as the first delivery stage, followed by integrations, financial intelligence, and a later marketplace. The supplied digital-operating-system text uses the name **Jenga**; confirm whether that is an earlier or separate product name before circulating this document externally.
