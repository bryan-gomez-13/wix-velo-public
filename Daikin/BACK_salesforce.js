import jsforce from "jsforce";
import { getSecret } from "wix-secrets-backend";

const loginUrl = "https://test.salesforce.com/";
const sfConn = new jsforce.Connection({ loginUrl });

async function authenticateAccount() {
    try {
        const sfAccountSecretStr = await getSecret("velo-salesforce-credentials");
        const sfAccountSecret = JSON.parse(sfAccountSecretStr);
        await sfConn.login(
            sfAccountSecret.username,
            sfAccountSecret.password + sfAccountSecret.token
        );
    } catch (err) {
        return Promise.reject(err);
    }
}

// Creates new given records in a Salesforce Object
export async function createRecords(sfObjName, records) {
    try {
        await authenticateAccount();
        return await sfConn.sobject(sfObjName).create(records);
    } catch (err) {
        return Promise.reject(err);
    }
}