import axios from "axios";

class IntercomClient {
    constructor(accessToken) {
        if (!accessToken) {
            throw new Error("Intercom Access Token must be provided.");
        }

        this.api = axios.create({
            baseURL: "https://api.intercom.io/",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
    }

    async fetchAllPaginatedData(endpoint) {
        console.log(`\n📦 Fetching data from Intercom endpoint: ${endpoint}`);

        let allRecords = [];
        let url = endpoint;
        let hasMore = true;

        while (hasMore) {
            try {
                const response = await this.api.get(url);
                const data = response.data;

                const pageRecords = data.data || [];
                allRecords.push(...pageRecords);

                if (data.pages?.next?.url) {
                    url = data.pages.next.url;
                    console.log(`   Fetched ${pageRecords.length}. Moving to next page...`);
                } else {
                    hasMore = false;
                }
            } catch (error) {
                console.error(`\n❌ Error fetching data from ${url}:`,
                    error.response?.data || error.message
                );
                break;
            }
        }

        console.log(`\n✅ Successfully fetched a total of ${allRecords.length} from ${endpoint}.`);
        return allRecords;
    }

    async fetchUsers() {
        return this.fetchAllPaginatedData("/contacts");
    }

    async fetchCompanies() {
        return this.fetchAllPaginatedData("/companies");
    }

    async getUsersByCompany(companyId) {
        try {
            const response = await this.api.get(`/contacts`, {
                params: {
                    company_id: companyId
                }
            });

            return response.data.data || [];
        } catch (err) {
            console.error(
                `\n❌ Error fetching users for Intercom company ${companyId}:`,
                err.response?.data || err.message
            );
            return [];
        }
    }

}

export { IntercomClient };
