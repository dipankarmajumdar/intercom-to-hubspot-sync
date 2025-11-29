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

# Environmental Veriable:

| Variable               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| INTERCOM_CLIENT_ID     | Intercom App Client ID for OAuth.                  |
| INTERCOM_CLIENT_SECRET | Intercom App Client Secret.                        |
| HUBSPOT_CLIENT_ID      | HubSpot App Client ID for OAuth.                   |
| HUBSPOT_CLIENT_SECRET  | HubSpot App Client Secret.                         |
| REDIRECT_URI           | The configured redirect URI for OAuth callback.    |
| HUBSPOT_REFRESH_TOKEN  | HubSpot Refresh Token (after initial OAuth grant). |
| INTERCOM_ACCESS_TOKEN  | Intercom Access Token (or use OAuth flow).         |

# Output Log:

```bash
==================================================
Intercom to HubSpot Sync Started
==================================================

📦 Fetching data from Intercom endpoint: /companies

✅ Successfully fetched a total of 4 from /companies.

📦 Fetching data from Intercom endpoint: /contacts

✅ Successfully fetched a total of 4 from /contacts.

Found 4 Companies and 4 Users in Intercom.

==================================================
Syncing Companies to HubSpot...
[Update] companies ID: 225932800699 updated.
[Update] companies ID: 225932784361 updated.
[Update] companies ID: 224635803364 updated.
[Update] companies ID: 225932784364 updated.

Companies Sync Complete. Total 4 synced.

==================================================
Syncing Users (Contacts) to HubSpot...
[Update] contacts ID: 337368796893 updated.
[Update] contacts ID: 337368648396 updated.
[Update] contacts ID: 337323062007 updated.
[Update] contacts ID: 337330921180 updated.

Contacts Sync Complete. Total 4 synced.

==================================================
Creating Associations (Company → Users)...
[Assoc] Contact 337368796893 → Company 225932800699
[Assoc] Contact 337368648396 → Company 225932800699
[Assoc] Contact 337323062007 → Company 225932800699
[Assoc] Contact 337330921180 → Company 225932800699
[Assoc] Contact 337368796893 → Company 225932784361
[Assoc] Contact 337368648396 → Company 225932784361
[Assoc] Contact 337323062007 → Company 225932784361
[Assoc] Contact 337330921180 → Company 225932784361
[Assoc] Contact 337368796893 → Company 224635803364
[Assoc] Contact 337368648396 → Company 224635803364
[Assoc] Contact 337323062007 → Company 224635803364
[Assoc] Contact 337330921180 → Company 224635803364
[Assoc] Contact 337368796893 → Company 225932784364
[Assoc] Contact 337368648396 → Company 225932784364
[Assoc] Contact 337323062007 → Company 225932784364
[Assoc] Contact 337330921180 → Company 225932784364

==================================================
Sync Process Finished Successfully!

Summary:

- Companies Synced: 4
- Contacts Synced: 4
- Associations Created: 16
```
