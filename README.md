# 🚀 Intercom to HubSpot Sync Integration

This project implements a synchronization script designed to migrate Contacts and Companies from an Intercom Workspace to a HubSpot CRM Portal, critically ensuring that the Contact-to-Company associations are correctly created using OAuth authentication and API calls.

## 🎯 Goal

To build a modular script that performs the following core tasks:

1.  **Authentication:** Use OAuth to secure Access Tokens for both Intercom and HubSpot.
2.  **Data Fetching:** Fetch all paginated Contacts (Users) and Companies from Intercom.
3.  **Data Upsert:** Upsert (create or update) these records into HubSpot, ensuring idempotency via a custom property (`intercom_id`).
4.  **Association:** Create the necessary Contact ↔ Company associations in HubSpot, using Intercom's internal linking data as the source.

## 🛠️ Setup and Installation

### 1. Prerequisites

- Node.js (LTS recommended)
- npm (Node Package Manager)
- Access to HubSpot Developer Account/Test Portal and Intercom Workspace/Developer App.

### 2. Installation

Clone your repository and install project dependencies:

```bash
git clone https://github.com/dipankarmajumdar/intercom-to-hubspot-sync.git
cd intercom-to-hubspot-sync
npm install
```
