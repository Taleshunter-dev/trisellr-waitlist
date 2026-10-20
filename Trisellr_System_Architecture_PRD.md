**TRISELLR**

**System Architecture  
Product Requirements Document**

Architecture requirements for the MVP and scale-ready foundation

| **Product**           | Trisellr                                                                                    |
|-----------------------|---------------------------------------------------------------------------------------------|
| **Document**          | System Architecture PRD                                                                     |
| **Version**           | 0.1 — Planning Draft                                                                        |
| **Date**              | 18 October 2026                                                                             |
| **Primary objective** | Define the technical foundation for business operations, AI assistance and growth guidance. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Architecture principle</strong></p>
<p>Build Trisellr as a modular monolith first: one deployable backend, one source of truth, strict domain boundaries, shared infrastructure, and clear seams for future extraction only when scale or team ownership justifies it.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**01 / EXECUTIVE SUMMARY**

# Executive summary

Trisellr is an AI-powered business operating system for small businesses. The system combines day-to-day operations, AI assistance and business growth guidance in one product. The architecture must support a guided Shopify-like experience rather than a generic analytics dashboard, while maintaining strong tenant isolation and an extensible domain model.

| **Dimension**   | **Requirement**                                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|
| Architecture    | Modular monolith with well-defined modules and internal domain events.                                                  |
| Clients         | Responsive web application first; mobile client can reuse the same API and contracts.                                   |
| Source of truth | PostgreSQL for business data, with object storage for media and Redis for cache/queues.                                 |
| AI              | Tool-based AI orchestration over permissioned business data; write actions are proposed and require approval initially. |
| Multi-tenancy   | Every business-owned entity is scoped by business_id and verified server-side.                                          |
| Growth guidance | Hybrid rule engine + AI wording/personalization, not LLM-only recommendations.                                          |
| Scale strategy  | Optimize the monolith, add asynchronous jobs and read models, then extract services only where necessary.               |

## Product architecture outcomes

- Users can run products, customers, orders, payments and inventory from one consistent system.

- Trisellr can understand business state and surface relevant next actions on Home and Grow.

- AI features operate on structured, permissioned data rather than free-form access to the database.

- Analytics, goals and badges are derived from real business events and outcomes.

- New industry-specific workflows can extend the platform without creating separate products.

**02 / SCOPE & SUCCESS CRITERIA**

# Scope and success criteria

## In scope for architecture v1

- Authentication and business workspaces

- Products and inventory

- Customers

- Orders and order items

- Payments and outstanding balances

- Home aggregation and setup guidance

- Grow: content, campaigns, storefront and follow-ups

- Analytics, goals and badges

- Ask Trisellr AI assistant

- Recommendation engine

- Notifications

- Background jobs

- Audit logs

- Role-based access control

- Object/media storage

- Observability and deployment pipeline

## Explicitly out of scope for v1

- Microservices as the default deployment model

- Marketplace matching between businesses and buyers

- Full accounting/ledger, payroll or tax filing

- Autonomous AI financial actions

- Complex social publishing to every channel

- Custom machine-learning recommendation models

- Kafka, Kubernetes or Elasticsearch unless proven necessary

- Separate codebases for each industry vertical

## Architecture success criteria

| **ID** | **Criterion**             | **Target**                                                                                            |
|--------|---------------------------|-------------------------------------------------------------------------------------------------------|
| ARC-01 | Tenant isolation          | No cross-business reads or writes in application tests and security reviews.                          |
| ARC-02 | Core workflow performance | P95 API latency under 500 ms for ordinary CRUD endpoints under expected MVP load.                     |
| ARC-03 | Reliability               | Critical business writes are transaction-safe and idempotent where external callbacks are involved.   |
| ARC-04 | AI safety                 | AI tools enforce user permissions and tenant scope; sensitive writes require explicit owner approval. |
| ARC-05 | Deployability             | Web and API can be deployed independently through CI/CD with rollback capability.                     |
| ARC-06 | Extensibility             | New modules can subscribe to domain events without direct database coupling.                          |
| ARC-07 | Observability             | Errors, latency, queue failures and major business events are traceable in staging and production.    |

**03 / TARGET ARCHITECTURE**

# Target system architecture

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>WEB APP (Next.js) MOBILE APP (later / Expo)<br />
| |<br />
+--------------- HTTPS ------------+<br />
|<br />
API / APPLICATION LAYER<br />
Auth • validation • tenant context • RBAC<br />
|<br />
---------------------------------------------------------<br />
Business Products Inventory Customers Orders Payments<br />
Grow Storefront Analytics Goals Badges AI Settings<br />
---------------------------------------------------------<br />
|<br />
Domain services + internal domain events<br />
|<br />
Recommendation Engine • AI Orchestrator • Notifications<br />
Analytics Aggregator • Background Jobs • Media Service<br />
|<br />
---------------------------------------------------------<br />
PostgreSQL Redis/Queues Object Storage Telemetry<br />
---------------------------------------------------------<br />
|<br />
Payments • WhatsApp • Email/SMS • AI providers</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Recommended stack

| **Layer**    | **Technology**                      | **Rationale**                                                                            |
|--------------|-------------------------------------|------------------------------------------------------------------------------------------|
| Web          | Next.js + TypeScript                | Strong routing, SSR where useful, mature React ecosystem and straightforward deployment. |
| Mobile       | React Native + Expo                 | Reuses TypeScript contracts and product knowledge while keeping UI native.               |
| Backend      | NestJS + TypeScript                 | Module boundaries, dependency injection, validation and background-job integration.      |
| Database     | PostgreSQL                          | Relational integrity fits orders, payments, customers and reporting.                     |
| ORM          | Prisma                              | Typed data access, schema migrations and productive development.                         |
| Cache/queues | Redis + BullMQ                      | Background jobs, throttling, cache and retryable workflows.                              |
| Media        | S3-compatible storage               | Product images and generated assets stay outside the relational database.                |
| Analytics    | PostHog + internal business metrics | Product analytics separate from customer-business reporting.                             |
| Monitoring   | Sentry + infrastructure metrics     | Application errors, traces and release monitoring.                                       |
| Repo         | Turborepo monorepo                  | Shared types, validation, API client and developer tooling.                              |

## Repository layout

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>trisellr/<br />
├── apps/<br />
│ ├── web/<br />
│ ├── mobile/<br />
│ └── api/<br />
├── packages/<br />
│ ├── ui/<br />
│ ├── types/<br />
│ ├── validation/<br />
│ ├── api-client/<br />
│ ├── domain/<br />
│ ├── analytics/<br />
│ └── config/<br />
├── prisma/<br />
├── tooling/<br />
└── turbo.json</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**04 / DOMAIN MODULES**

# Domain boundaries and responsibilities

| **Module**      | **Owns**                                                                | **Must not own**                                    |
|-----------------|-------------------------------------------------------------------------|-----------------------------------------------------|
| Businesses      | Business profile, currency, timezone, business type, workspace settings | Customer/order operational records.                 |
| Membership      | Users, business membership, role assignments, invitations               | Authentication provider internals.                  |
| Products        | Catalogue, services, variants, pricing, status                          | Order history or customer history.                  |
| Inventory       | Stock movements, reservations, adjustments                              | Product marketing content.                          |
| Customers       | Customer profile, tags, notes, relationship metadata                    | Payment processing logic.                           |
| Orders          | Order lifecycle, order items, status history, due dates                 | Payment-provider implementation details.            |
| Payments        | Receipts, payment status, provider references, refunds                  | Order item mutation except through services/events. |
| Grow            | Campaigns, content drafts, follow-up workflows                          | Core business records.                              |
| Storefront      | Public catalogue exposure, slug, theme and visibility                   | Internal-only data or administrative notes.         |
| Analytics       | Derived metrics and reporting read models                               | Canonical transactional data.                       |
| Goals/Badges    | Goal definitions, progress, milestone recognition                       | Gamified XP or virtual-shop state.                  |
| AI              | Intent routing, tool calls, responses, action proposals                 | Unrestricted direct database access.                |
| Recommendations | Business rules, priorities, lifecycle of next actions                   | Generic chat history.                               |
| Notifications   | In-app/email/SMS notification records and delivery requests             | Business decision logic.                            |
| Audit           | Immutable record of sensitive changes                                   | Primary business logic.                             |

## Module implementation convention

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>orders/<br />
├── orders.controller.ts<br />
├── orders.service.ts<br />
├── orders.repository.ts<br />
├── orders.dto.ts<br />
├── orders.events.ts<br />
├── orders.policy.ts<br />
└── orders.module.ts</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Boundary rule</strong></p>
<p>Modules may call another module through an exported service contract or react to domain events. They must not reach into another module’s repository or tables directly as an informal shortcut.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**05 / DATA MODEL**

# Core data model requirements

The operational database is PostgreSQL. All business-owned records must carry business_id or be reachable through a parent that is strictly scoped to a business. Foreign keys, unique constraints and transactions are required for integrity-critical flows.

| **Entity**                  | **Key fields / requirements**                                                                              |
|-----------------------------|------------------------------------------------------------------------------------------------------------|
| User                        | id, auth_provider_id, profile fields; no business data ownership directly.                                 |
| Business                    | id, name, slug, type, currency, country, timezone, status.                                                 |
| BusinessMember              | business_id, user_id, role, status; unique membership pair.                                                |
| Product                     | business_id, name, description, type, price, compare_at_price, status, track_inventory.                    |
| ProductVariant              | product_id, sku, option values, price override, status.                                                    |
| InventoryMovement           | business_id, product/variant, type, quantity, reason, reference entity.                                    |
| Customer                    | business_id, contact details, source, notes, last_purchase_at; computed metrics may be cached.             |
| Order                       | business_id, customer_id, order_number, totals, amount_paid, amount_due, status, payment_status, due_date. |
| OrderItem                   | order_id, product/variant IDs, name_snapshot, quantity, unit_price, line_total.                            |
| Payment                     | business_id, order_id, customer_id, reference, amount, method, status, provider, paid_at.                  |
| Recommendation              | business_id, type, priority, title, reason, entity reference, status, expiry.                              |
| Goal                        | business_id, type, target, current_value, period, starts_at, ends_at, status.                              |
| Badge / BusinessBadge       | Badge definition plus earned milestone record and metadata.                                                |
| Campaign / MarketingContent | business_id, channel, type, content, product references, status, generated_by_ai.                          |
| Automation / AutomationRun  | trigger, conditions, action, approval mode, run history, outcome.                                          |
| Notification                | business_id, user_id, type, entity reference, read state, timestamps.                                      |
| AuditLog                    | business_id, user_id, action, entity type/id, before/after, metadata, timestamp.                           |
| FileAsset                   | business_id, object key/url, MIME type, size, owner/entity reference.                                      |

## Inventory model

Inventory must be movement-based rather than a mutable stock number as the only source of truth. Current stock can be materialized/cached for speed but must be reconcilable to movements.

| **Movement** | **Example**                                    |
|--------------|------------------------------------------------|
| stock_in     | New stock received or manufactured.            |
| sale         | Stock consumed by a completed/confirmed order. |
| return       | Customer return accepted back into stock.      |
| adjustment   | Manual correction with reason.                 |
| damaged      | Units removed because they cannot be sold.     |
| reserved     | Units held for an order before completion.     |
| released     | Reservation cancelled or released.             |

**06 / API & APPLICATION SERVICES**

# API and service requirements

- REST API for v1 under /api/v1.

- Server-side validation for every write request.

- Active business resolved from authenticated session/workspace context, not trusted from arbitrary client input.

- Consistent error envelope with stable error codes.

- Cursor pagination preferred for large feeds; page-based pagination acceptable for small administrative tables.

- Idempotency keys for payment webhooks and retry-prone external operations.

- OpenAPI documentation generated from the API service.

## Representative endpoints

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GET /api/v1/home<br />
GET /api/v1/business<br />
GET /api/v1/products<br />
POST /api/v1/products<br />
GET /api/v1/customers<br />
POST /api/v1/customers<br />
GET /api/v1/orders<br />
POST /api/v1/orders<br />
PATCH /api/v1/orders/:id/status<br />
GET /api/v1/payments<br />
POST /api/v1/payments<br />
GET /api/v1/grow/recommendations<br />
POST /api/v1/grow/content<br />
GET /api/v1/analytics/overview<br />
POST /api/v1/ai/chat<br />
POST /api/v1/ai/actions/:id/approve</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Home aggregation contract

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>GET /api/v1/home<br />
{<br />
businessSummary,<br />
setupProgress,<br />
recommendations[],<br />
alerts[],<br />
aiPrompts[],<br />
growthActions[],<br />
goalProgress,<br />
achievements[]<br />
}</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

The Home service is a read-optimized aggregator. The web client should not need to call ten separate endpoints to assemble the first screen.

**07 / AI & RECOMMENDATION ARCHITECTURE**

# Ask Trisellr and growth guidance

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>AI requirement</strong></p>
<p>AI is an orchestration layer over approved tools and business context. The model does not receive database credentials, cannot issue unrestricted queries, and does not perform sensitive writes without a deliberate approval workflow.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## AI request flow

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>User message<br />
↓<br />
Intent + context resolver<br />
↓<br />
Permission / tenant check<br />
↓<br />
Approved tools retrieve business facts<br />
↓<br />
Model composes answer or proposes action<br />
↓<br />
Owner reviews action (when write/external side effect)<br />
↓<br />
Application service executes + audit log</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Initial AI tools

| **Tool**                  | **Purpose**                                        |
|---------------------------|----------------------------------------------------|
| get_business_summary      | High-level business state for context.             |
| get_orders                | Search/filter orders inside the active business.   |
| get_overdue_orders        | Retrieve orders past due and not completed.        |
| get_customers             | Search customer records.                           |
| get_customer_history      | Orders and relationship activity for one customer. |
| get_products              | Catalogue and availability.                        |
| get_low_stock_products    | Products below configurable threshold.             |
| get_best_selling_products | Top products for selected period.                  |
| get_outstanding_payments  | Balances awaiting collection.                      |
| create_marketing_draft    | Generate a content draft, not publish.             |
| create_followup_draft     | Prepare customer follow-up for approval.           |
| create_campaign_draft     | Prepare campaign parameters/content for approval.  |

## Recommendation engine

Recommendations should be generated by deterministic rules first, with AI used for natural-language explanation, prioritization support and drafting. This keeps critical business guidance explainable and testable.

| **Rule example**                                  | **Result**                                                 |
|---------------------------------------------------|------------------------------------------------------------|
| Payment overdue \> 7 days AND balance \> 0        | Recommend reviewing or drafting a payment follow-up.       |
| Stock \> 5 AND no sales in 30 days                | Recommend promoting the product.                           |
| Customer has 2+ orders AND inactive \> 60 days    | Recommend a win-back follow-up.                            |
| Order due within 24 hours AND not ready/completed | Recommend order update.                                    |
| Goal progress materially behind expected pace     | Recommend a relevant growth action, not a generic warning. |

**08 / EVENTS, JOBS & AUTOMATION**

# Domain events and asynchronous processing

The monolith should publish internal domain events after successful transactions. Event handlers update secondary concerns without forcing direct coupling between modules.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>OrderCompleted<br />
├── Inventory: finalize stock movement<br />
├── Analytics: update read model<br />
├── Goals: recalculate progress<br />
├── Badges: evaluate milestones<br />
├── Recommendations: refresh affected actions<br />
└── Notifications: enqueue user-facing update</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Background job queues

| **Queue / job**        | **Requirement**                                                 |
|------------------------|-----------------------------------------------------------------|
| ai-generation          | Retryable AI content generation with timeout and cost metadata. |
| notifications          | Delivery jobs for in-app, email, SMS and later WhatsApp.        |
| recommendation-refresh | Scheduled and event-triggered rule evaluation.                  |
| analytics-aggregation  | Daily/periodic metric aggregation.                              |
| media-processing       | Image validation, resizing and thumbnail generation.            |
| integration-sync       | External provider synchronization with exponential backoff.     |
| goal-badge-check       | Evaluate milestones after relevant events.                      |
| automation-run         | Execute approved automations with full run logs.                |

## Automation model

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>TRIGGER → CONDITIONS → ACTION → APPROVAL MODE → EXECUTION LOG<br />
Example:<br />
Customer inactive 60 days → previous_orders &gt;= 2<br />
→ create WhatsApp follow-up draft → owner approval → send through integration</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**09 / ANALYTICS, GOALS & BADGES**

# Business intelligence requirements

Operational data remains canonical. Analytics uses derived read models to keep dashboards fast as data volume grows.

| **Metric area** | **Initial measures**                                                            |
|-----------------|---------------------------------------------------------------------------------|
| Sales           | Gross recorded sales, received payments, outstanding balance, sales trend.      |
| Orders          | Created, completed, cancelled, overdue, average order value.                    |
| Customers       | Total, new, repeat, repeat purchase rate, inactive customers.                   |
| Products        | Units/orders, revenue, low stock, no-sale period.                               |
| Growth          | Campaign drafts/exports, follow-up actions, storefront activity when available. |
| Goals           | Current value, target, period progress, achieved date.                          |
| Badges          | Milestones earned from verified operational events only.                        |

## Daily metric read model

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>DailyBusinessMetric<br />
- business_id<br />
- date<br />
- sales<br />
- orders_created<br />
- orders_completed<br />
- customers_added<br />
- repeat_customers<br />
- payments_received<br />
- outstanding_balance<br />
- products_sold<br />
- generated_at</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Badge requirements

- No XP, virtual shop or arbitrary engagement points.

- Badges must represent real business outcomes or meaningful operating consistency.

- Badge rules are versioned and evaluated from auditable events/metrics.

- Earning a badge may trigger a small notification and appear in Progress/Home, but must not block workflows.

**10 / SECURITY & TENANCY**

# Security, permissions and data isolation

| **Area**         | **Requirement**                                                                                                  |
|------------------|------------------------------------------------------------------------------------------------------------------|
| Authentication   | Use a managed, standards-based identity provider initially; secure session cookies or equivalent token strategy. |
| Tenant isolation | Every server query is scoped through active business context; never trust client-supplied business_id by itself. |
| Authorization    | RBAC enforced on the server for read/write actions.                                                              |
| Roles            | OWNER, ADMIN, STAFF, VIEWER for v1; move to granular permission sets when needed.                                |
| Secrets          | Environment-managed secrets; no credentials in client code or logs.                                              |
| Transport        | TLS everywhere in production.                                                                                    |
| Files            | Signed upload URLs, MIME/size checks and business-scoped file records.                                           |
| Payments         | Webhook signature verification, idempotency, immutable provider references.                                      |
| AI               | Tool allowlist, permission checks, tenant scoping, prompt-injection-resistant data/tool boundaries.              |
| Audit            | Record sensitive changes and automation/AI approvals.                                                            |
| Backups          | Automated managed-Postgres backups and tested restore procedure.                                                 |
| Privacy          | Data export/deletion workflows designed before public scale; minimize stored personal data.                      |

## Permission examples

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>products.read products.write<br />
orders.read orders.write<br />
customers.read customers.write<br />
payments.read payments.write<br />
analytics.read grow.write<br />
settings.read settings.write<br />
members.manage</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**11 / NON-FUNCTIONAL REQUIREMENTS**

# Performance, reliability and operability

| **NFR**           | **Requirement**                                                                                                    |
|-------------------|--------------------------------------------------------------------------------------------------------------------|
| Performance       | P95 ordinary API responses \< 500 ms under expected MVP load; Home aggregation may be cached briefly per business. |
| Availability      | Target 99.5%+ for early production; graceful degradation if AI or optional integrations fail.                      |
| Consistency       | Orders/payments/inventory changes use database transactions where invariants span multiple records.                |
| Idempotency       | External callbacks and retryable commands must not duplicate payments, messages or inventory effects.              |
| Rate limiting     | Protect login, AI generation, search and public storefront endpoints.                                              |
| Offline tolerance | Web forms preserve unsaved work where practical; mobile can add offline-first behavior later.                      |
| Accessibility     | Keyboard navigation, focus states, labels, contrast and semantic markup for core web workflows.                    |
| Localization      | Currency, timezone and date formatting must be business-aware; NGN is a primary launch case.                       |
| Logging           | Structured application logs with request/business/user correlation IDs, excluding sensitive payloads.              |
| Observability     | Error tracking, API latency, queue depth/failures, database health and external-provider failures.                 |
| Cost controls     | AI requests record provider/model/token cost metadata and support configurable usage limits.                       |
| Migration safety  | Backward-compatible migrations for live deployments; destructive changes require staged rollout.                   |

## Environment model

| **Environment** | **Purpose**                                                                            |
|-----------------|----------------------------------------------------------------------------------------|
| Local           | Developer machine, local DB/Redis or approved dev services.                            |
| Development     | Shared integration environment for active development.                                 |
| Staging         | Production-like data shape and integrations in test/sandbox mode.                      |
| Production      | Real businesses and live external providers; restricted access and audited operations. |

**12 / FRONTEND ARCHITECTURE**access
# Web application structure

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>apps/web/<br />
├── app/<br />
│ ├── home/<br />
│ ├── business/<br />
│ ├── products/<br />
│ ├── customers/<br />
│ ├── grow/<br />
│ ├── analytics/<br />
│ └── settings/<br />
├── features/<br />
│ ├── orders/<br />
│ ├── payments/<br />
│ ├── recommendations/<br />
│ └── ai/<br />
├── components/<br />
└── lib/</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Shared UI primitives

- Button, Input, Select, Textarea, SearchInput

- Card, ActionCard, StatCard, EmptyState

- Table, Tabs, Pagination, Filter, Sort

- Badge, Avatar, Progress, Tooltip

- Modal, Drawer, Dropdown, Command menu, Toast

- AIComposer, RecommendationCard, SetupChecklist

- OrderStatusBadge, PaymentStatusBadge, ProductStockBadge, CustomerStatusBadge

## Design-system requirement

The current Trisellr visual language—dark sidebar, white workspace, generous spacing, thin borders, restrained color and action-led cards—must be implemented through reusable design tokens rather than page-specific CSS. The UI should feel closer to Shopify/ElevenLabs than a dense enterprise dashboard.

## Routing requirement

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th>/home<br />
/business<br />
/business/orders<br />
/business/payments<br />
/products<br />
/products/new<br />
/products/:id<br />
/customers<br />
/customers/:id<br />
/grow<br />
/grow/content<br />
/grow/campaigns<br />
/grow/storefront<br />
/grow/automations<br />
/analytics<br />
/settings</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**13 / DELIVERY PLAN**

# Recommended build sequence

| **Phase**       | **Scope**                                                                         | **Exit condition**                                                      |
|-----------------|-----------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| 1\. Foundation  | Monorepo, CI/CD, auth, businesses, memberships, design system, DB, observability. | User can sign in, create/select business and navigate stable app shell. |
| 2\. Operations  | Products, inventory, customers, orders, payments.                                 | A business can record and complete a real sales workflow end to end.    |
| 3\. Guided Home | Setup checklist, Home aggregator, alerts, deterministic recommendations, goals.   | Home changes from onboarding to operational guidance using real data.   |
| 4\. Grow        | Marketing drafts, campaigns, storefront, follow-ups.                              | User can turn operational data into a growth action.                    |
| 5\. AI          | Ask Trisellr, tool registry, context resolver, approval flow.                     | AI answers business questions and prepares safe drafts/actions.         |
| 6\. Analytics   | Read models, product/customer/sales insights, badges.                             | Analytics screens are fast and based on auditable operational data.     |
| 7\. Automation  | Triggers, conditions, actions, approvals, execution history.                      | Selected repetitive workflows run reliably and transparently.           |

## Definition of done for each module

- Database schema and migrations committed.

- Server-side policy/tenant checks implemented.

- API contract and validation complete.

- UI supports loading, success, empty and error states.

- Audit/analytics events added where relevant.

- Unit/integration tests cover critical invariants.

- Observability and actionable error handling included.

- Documentation updated in the repository.

**14 / ARCHITECTURE ACCEPTANCE CRITERIA**

# MVP architecture acceptance criteria

| **ID** | **Acceptance criterion**                                                                                                      | **Priority** |
|--------|-------------------------------------------------------------------------------------------------------------------------------|--------------|
| AC-01  | A user may belong to multiple businesses and can switch active business without data leakage.                                 | P0           |
| AC-02  | Products, customers, orders and payments are isolated by business and enforced server-side.                                   | P0           |
| AC-03  | An order can contain snapshot-priced items, accept partial payments and maintain a correct outstanding balance.               | P0           |
| AC-04  | Inventory movements remain reconcilable after orders, cancellations and manual adjustments.                                   | P0           |
| AC-05  | Home can show setup state for a new business and recommended actions for an active business through one aggregation contract. | P0           |
| AC-06  | AI can retrieve allowed business facts through tools but cannot query arbitrary tenant data.                                  | P0           |
| AC-07  | AI-generated external/write actions remain drafts until user approval in v1.                                                  | P0           |
| AC-08  | Domain events can update analytics, goals, badges and recommendations without circular repository dependencies.               | P1           |
| AC-09  | Payment and integration callbacks are signature-verified and idempotent.                                                      | P0           |
| AC-10  | Analytics screens use read models/aggregations once live computation becomes expensive.                                       | P1           |
| AC-11  | Background jobs expose retry/failure status and do not silently lose work.                                                    | P0           |
| AC-12  | Critical actions generate audit records with actor and entity context.                                                        | P1           |
| AC-13  | Web design uses shared tokens/components and maintains consistent Trisellr interaction patterns.                              | P1           |
| AC-14  | Staging mirrors production architecture closely enough to validate migrations and integrations before release.                | P0           |

## Architecture decision records required before implementation

- Authentication provider

- Cloud/hosting provider for API and PostgreSQL

- Object storage provider

- Payment provider(s) for first pilot

- AI provider/model routing strategy

- WhatsApp integration path

- Data retention and deletion policy

- Backup retention and disaster-recovery target

**15 / RISKS & OPEN DECISIONS**

# Architecture risks and mitigations

| **Risk**                                                  | **Impact**               | **Mitigation**                                                                                      |
|-----------------------------------------------------------|--------------------------|-----------------------------------------------------------------------------------------------------|
| Trying to serve too many verticals with hard-coded fields | Schema and UI complexity | Use shared core entities plus extension tables/metadata only for validated vertical needs.          |
| AI cost grows faster than revenue                         | Margin pressure          | Hybrid rules, caching, smaller models for classification/drafting, usage telemetry and plan limits. |
| AI hallucination affects business decisions               | Trust loss               | Ground answers in tool results, show source facts, constrain actions and require approvals.         |
| Analytics queries slow operational DB                     | Poor UX                  | Create read models and scheduled aggregates as usage grows.                                         |
| External integrations are unreliable                      | Broken automations       | Async jobs, retries, idempotency, provider status tracking and graceful fallback.                   |
| Permission bugs expose customer data                      | Severe security issue    | Central tenant context, policy layer, test fixtures for cross-tenant attacks, audit logging.        |
| Overengineering before validation                         | Slow delivery            | Keep modular monolith; defer service extraction and complex infrastructure.                         |
| Data model cannot support services/custom jobs            | Feature friction         | Product type supports physical/service/custom; order items retain snapshots and flexible metadata.  |

## Open product/architecture decisions

- Which business segment is first pilot and therefore which industry extensions are truly required?

- Will checkout/payment collection be in MVP or will Trisellr primarily record payments made elsewhere?

- Which actions may AI eventually execute automatically versus always require approval?

- How much storefront customization is needed before the first pilot?

- Which notification channels are essential at launch?

- What level of offline/mobile support is required for initial Nigerian field usage?

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><p><strong>Recommended starting point</strong></p>
<p>Approve the architecture decisions above, then implement Phase 1 and Phase 2 only. Do not start the AI or automation layers until orders, customers, products, payments and tenancy rules are stable enough to provide trustworthy data.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

**END OF DOCUMENT**
