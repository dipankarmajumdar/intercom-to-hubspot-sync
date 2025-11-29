import axios from "axios";

const HS_ASSOCIATION_TYPE = "contact_to_company";

class HubSpotClient {
    constructor(accessToken) {
        if (!accessToken) {
            throw new Error("HubSpot Access Token must be provided.");
        }

        this.api = axios.create({
            baseURL: "https://api.hubapi.com/",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
    }

    async findRecordByIntercomId(objectType, intercomId) {
        const url = `/crm/v3/objects/${objectType}/search`;
        const body = {
            filterGroups: [
                {
                    filters: [
                        {
                            propertyName: "intercom_id",
                            operator: "EQ",
                            value: intercomId
                        }
                    ]
                }
            ],
            properties: ["hs_object_id", "intercom_id"],
            limit: 1
        };

        try {
            const res = await this.api.post(url, body);
            return res.data.results.length > 0 ? res.data.results[0] : null;
        } catch {
            return null;
        }
    }

    async upsertRecord(objectType, intercomId, properties) {
        const baseUrl = `/crm/v3/objects/${objectType}`;
        const payload = {
            properties: {
                ...properties,
                intercom_id: String(intercomId)
            }
        };

        const existing = await this.findRecordByIntercomId(objectType, intercomId);

        // UPDATE
        if (existing) {
            try {
                const url = `${baseUrl}/${existing.id}`;
                const res = await this.api.patch(url, payload);
                console.log(`   [Update] ${objectType} ID: ${existing.id} updated.`);
                return res.data;
            } catch (err) {
                console.error(`\n❌ Update failed for ${objectType} ${existing.id}:`, err.response?.data || err.message);
                throw err;
            }
        }

        // CREATE
        try {
            const res = await this.api.post(baseUrl, payload);
            console.log(`   [Create] ${objectType} created → ID: ${res.data.id}`);
            return res.data;
        } catch (err) {
            console.error(`\n❌ Create failed for ${objectType}:`, err.response?.data || err.message);
            throw err;
        }
    }

    async upsertContact(intercomUser) {
        const props = {
            email: intercomUser.email,
            firstname: intercomUser.name || "",
            lastname: intercomUser.last_name || "",
            phone: intercomUser.phone || ""
        };
        return this.upsertRecord("contacts", intercomUser.id, props);
    }

    async upsertCompany(intercomCompany) {
        const props = {
            name: intercomCompany.name,
            website: intercomCompany.website || ""
        };
        return this.upsertRecord("companies", intercomCompany.id, props);
    }

    async createAssociation(contactId, companyId) {
        const url = `/crm/v4/associations/contacts/companies/batch/create`;

        const payload = {
            inputs: [
                {
                    from: { id: String(contactId) },
                    to: { id: String(companyId) },
                    type: HS_ASSOCIATION_TYPE
                }
            ]
        };

        try {
            await this.api.post(url, payload);
            console.log(`   [Assoc] Contact ${contactId} → Company ${companyId}`);
            return true;
        } catch (err) {
            const msg = err.response?.data || err.message;

            if (msg?.status === "CONFLICT") {
                console.log(`   [Assoc] Already exists: Contact ${contactId} & Company ${companyId}`);
                return true;
            }

            console.error(`\n❌ Association failed:`, msg);
            return false;
        }
    }
}

export { HubSpotClient };
