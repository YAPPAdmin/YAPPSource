# YAPP
**Yet Another Portfolio Platform**

YAPP is a privacy-first, serverless platform designed for building dynamic portfolios and writing webblogs. Built with a focus on data sovereignty and low operating costs (~ 5€/Month), it leverages a modern stack to deliver a seamless editing and viewing experience without the need for a traditional self-hosted backend.

---

## Tech Stack

* **Frontend & API:** [SvelteKit](https://kit.svelte.dev/) (deployed via Vercel Serverless Functions)
* **Database:** [SurrealDB Cloud](https://surrealdb.com/) (Graph/Relational database for content and relationships)
* **Authentication:** [Auth.js](https://authjs.dev/) (Passwordless Magic Links & GitHub OAuth)
* **Media Storage:** Hetzner Storage Box (Custom SFTP integration, bypassing AWS S3)
* **Rich Text Editing:** [Tiptap](https://tiptap.dev/)

---

## Core Features

### Block-Based Portfolio Editor
A highly decoupled, drag-and-drop page builder.
* **Canvas & Palette:** Dynamically instantiate and arrange UI blocks.
* **Property Editor:** Schema-driven data mutation for deep customization.
* **Custom Component Renderer:** Safely translates stored JSON configurations back into live Svelte components (`<svelte:component>`).

### Webblog Editor & Version Control
A robust writing environment with Git-like history.
* **Hybrid Persistence:** Local `localStorage` auto-saves combined with debounced server syncing.
* **Linear History:** Revert changes, branch off previous versions, or restore specific historical drafts.

### Privacy & Compliance
* **Cookie Law Exception:** Utilizes HTTP-only session tokens to legally omit cookie consent banners.
* **Data Sovereignty:** All user data and media are strictly routed through EU-based infrastructure.

### Centralized Logging
A dual-write structured logging system (`INFO`, `WARN`, `ERROR`, `CRIT`, `SECURITY`) that outputs color-coded terminal messages in development and persists auditable records to SurrealDB.

---

## Local Development

### Prerequisites
* Node.js (v18+)
* A SurrealDB instance (Local or Cloud)
* A Hetzner Storage Box (for media uploads)
* SMTP Credentials (for Auth.js Magic Links)