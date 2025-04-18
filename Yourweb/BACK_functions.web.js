import { Permissions, webMethod } from "wix-web-module";
import wixSecretsBackend from 'wix-secrets-backend';
import { contacts } from "wix-crm-backend";
import { fetch } from 'wix-fetch';

export const makeContactsSubscriber = webMethod(Permissions.Anyone, async () => {
    try {
        const queryResults = await contacts.queryContacts().ne("info.extendedFields.emailSubscriptions.subscriptionStatus", "SUBSCRIBED").limit(1000).find({ suppressAuth: true });
        const items = queryResults.items;

        return queryResults

        const promises = items.map(item => upsertEmailSubscription(item.primaryInfo.email));
        await Promise.all(promises);

        return "ok"
    } catch (error) { console.error(error) }
});

export const searchSubscribe = webMethod(Permissions.Anyone, async (email) => {
    try {
        const queryResults = await contacts.queryContacts().eq("primaryInfo.email", email).ne("info.extendedFields.emailSubscriptions.subscriptionStatus", "SUBSCRIBED").limit(1000).find({ suppressAuth: true });
        const item = queryResults.items[0];
        console.log(item)
        await upsertEmailSubscription(item.primaryInfo.email)
    } catch (error) { console.error(error) }
});

export const upsertEmailSubscription = webMethod(Permissions.Anyone, async (email) => {
    try {
        const token = await wixSecretsBackend.getSecret("ApiKey");
        const url = "https://www.wixapis.com/email-marketing/v1/email-subscriptions";

        let options = {
            "headers": {
                "Content-Type": "application/json",
                "Authorization": token
            },
            "method": "POST",
            "body": JSON.stringify({
                "subscription": {
                    "email": email,
                    "subscriptionStatus": "SUBSCRIBED",
                    "deliverabilityStatus": "VALID"
                }
            })
        }
        let apiResponse = await fetch(url, options);
        console.log(apiResponse)
        if (!apiResponse.ok) return false;
        let request = await apiResponse.text();
        return JSON.parse(request);
    } catch (error) {
        throw new Error("Error to get token");
    }
});