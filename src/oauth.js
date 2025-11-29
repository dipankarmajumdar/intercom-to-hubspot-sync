
import "dotenv/config";
import axios from "axios";
import { URLSearchParams } from "url";

const {
    INTERCOM_CLIENT_ID,
    INTERCOM_REDIRECT_URI,
    INTERCOM_CLIENT_SECRET,
    HUBSPOT_CLIENT_ID,
    HUBSPOT_REDIRECT_URI,
    HUBSPOT_CLIENT_SECRET,
} = process.env;


export function getIntercomAuthUrl() {
    const scope = "read_users write_users read_companies write_companies";
    const authUrl = `https://app.intercom.com/oauth?client_id=${INTERCOM_CLIENT_ID}&redirect_uri=${INTERCOM_REDIRECT_URI}&response_type=code&scope=${scope}`;
    return authUrl;
}

export function getHubSpotAuthUrl() {
    const scope = 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.companies.read crm.objects.companies.write';
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&redirect_uri=${HUBSPOT_REDIRECT_URI}&scope=${encodeURIComponent(scope)}`;
    return authUrl;
}

export async function exchangeCodeForToken(code, platform) {
    const isIntercom = platform === 'intercom';
    const tokenUrl = isIntercom
        ? 'https://api.intercom.io/auth/eagle/token'
        : 'https://api.hubapi.com/oauth/v1/token';

    const data = isIntercom ? {
        client_id: INTERCOM_CLIENT_ID,
        client_secret: INTERCOM_CLIENT_SECRET,
        code: code,
    } : {
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CLIENT_ID,
        client_secret: HUBSPOT_CLIENT_SECRET,
        redirect_uri: HUBSPOT_REDIRECT_URI,
        code: code,
    };

    try {
        const response = await axios.post(tokenUrl, new URLSearchParams(data).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log(`\n✅ ${platform.toUpperCase()} Token Received Successfully!`);
        console.log(`\n🔑 Access Token to paste in .env: ${response.data.access_token}`);
        if (response.data.refresh_token) {
            console.log(`🔄 Refresh Token (for future use): ${response.data.refresh_token}`);
        }
        return response.data;
    } catch (error) {
        console.error(`\n❌ Error exchanging code for ${platform} token:`, error.response?.data || error.message);
        throw new Error(`Failed to get ${platform} token.`);
    }
}

async function main() {
    console.log('--- OAuth Authorization Links ---');
    console.log(`\n🔗 Intercom Auth URL: \n${getIntercomAuthUrl()}`);
    console.log(`\n🔗 HubSpot Auth URL: \n${getHubSpotAuthUrl()}`);

    console.log('\n--- Next Steps (Manual) ---');
    console.log('1. Visit the links above in your browser.');
    console.log('2. After successful authorization, the browser will redirect you to your redirect_uri with a `code` in the URL.');
    console.log('3. Copy that `code` and use it to call the `exchangeCodeForToken(code, platform)` function in a separate script.');
}

main();