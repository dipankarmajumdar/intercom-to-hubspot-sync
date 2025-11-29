import "dotenv/config";
import { IntercomClient } from "./clients/intercom.js";
import { HubSpotClient } from "./clients/hubspot.js";

const INTERCOM_ACCESS_TOKEN = process.env.INTERCOM_ACCESS_TOKEN;
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

async function runSync() {
    console.log("==================================================");
    console.log("Intercom to HubSpot Sync Started");
    console.log("==================================================\n");

    if (!INTERCOM_ACCESS_TOKEN || !HUBSPOT_ACCESS_TOKEN) {
        console.error(
            "\nERROR: Please ensure INTERCOM_ACCESS_TOKEN and HUBSPOT_ACCESS_TOKEN are set in the .env file."
        );
        return;
    }

    try {
        const intercom = new IntercomClient(INTERCOM_ACCESS_TOKEN);
        const hubspot = new HubSpotClient(HUBSPOT_ACCESS_TOKEN);

        // FETCH DATA
        const intercomCompanies = await intercom.fetchCompanies();
        const intercomUsers = await intercom.fetchUsers();

        console.log(
            `\nFound ${intercomCompanies.length} Companies and ${intercomUsers.length} Users in Intercom.`
        );

        // ---------------- COMPANIES UPSERT ----------------
        console.log("\n==================================================");
        console.log("Syncing Companies to HubSpot...");

        const companyIdMap = {};

        for (const company of intercomCompanies) {
            try {
                const hsCompany = await hubspot.upsertCompany(company);
                companyIdMap[company.id] = hsCompany.id;
            } catch (e) {
                console.error(`\nSkipping Company ${company.id} due to error.`);
            }
        }

        console.log(
            `\nCompanies Sync Complete. Total ${Object.keys(companyIdMap).length} synced.`
        );

        // ---------------- CONTACTS UPSERT ----------------
        console.log("\n==================================================");
        console.log("Syncing Users (Contacts) to HubSpot...");

        const contactIdMap = {}; // Intercom → HubSpot Contact ID
        let successfulContacts = 0;

        for (const user of intercomUsers) {
            try {
                const hsContact = await hubspot.upsertContact(user);
                contactIdMap[user.id] = hsContact.id;
                successfulContacts++;
            } catch (e) {
                console.error(
                    `\nSkipping User ${user.id} (${user.email}) due to error.`
                );
            }
        }

        console.log(`\nContacts Sync Complete. Total ${successfulContacts} synced.`);

        // ---------------- ASSOCIATIONS CREATION ----------------
        console.log("\n==================================================");
        console.log("Creating Associations (Company → Users)...");

        let successfulAssociations = 0;

        for (const company of intercomCompanies) {
            const intercomCompanyId = company.id;
            const hubspotCompanyId = companyIdMap[intercomCompanyId];

            if (!hubspotCompanyId) {
                console.log(
                    `   [Assoc] Skipping company ${intercomCompanyId}: not found in HubSpot`
                );
                continue;
            }

            const usersOfCompany = await intercom.getUsersByCompany(intercomCompanyId);

            if (!usersOfCompany.length) {
                console.log(
                    `   [Assoc] No users found for company ${intercomCompanyId}`
                );
                continue;
            }

            // Create associations
            for (const user of usersOfCompany) {
                const hubspotContactId = contactIdMap[user.id];

                if (!hubspotContactId) {
                    console.log(
                        `   [Assoc] Skipping user ${user.id}: not found in HubSpot`
                    );
                    continue;
                }

                const okay = await hubspot.createAssociation(
                    hubspotContactId,
                    hubspotCompanyId
                );

                if (okay) successfulAssociations++;
            }
        }

        // ---------------- SUMMARY ----------------
        console.log("\n==================================================");
        console.log("Sync Process Finished Successfully!");
        console.log("\nSummary:");
        console.log(
            `   - Companies Synced: ${Object.keys(companyIdMap).length}`
        );
        console.log(`   - Contacts Synced: ${successfulContacts}`);
        console.log(`   - Associations Created: ${successfulAssociations}`);
        console.log("==================================================\n");

    } catch (error) {
        console.error("\nCRITICAL ERROR during sync process:", error.message);
    }
}

runSync();
