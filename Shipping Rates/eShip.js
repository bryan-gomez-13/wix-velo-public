import { fetch } from 'wix-fetch';
import wixData from 'wix-data';
import wixSecretsBackend from 'wix-secrets-backend';

export async function rates(json) {
    const ApiKey = await wixSecretsBackend.getSecret("ApiKey");
    const SubscriptionKey = await wixSecretsBackend.getSecret("SubscriptionKey");
	let rate;

    await fetch("https://api.starshipit.com/api/rates", {
            "method": "post",
            "headers": {
                "Content-Type": "application/json",
                "StarShipIT-Api-Key": ApiKey,
                "Ocp-Apim-Subscription-Key": SubscriptionKey
            },
            "body": JSON.stringify(json)
        })
        .then((httpResponse) => {
            if (httpResponse.ok) {
                //console.log('Done');
                return httpResponse.json();
            } else {
                return Promise.reject("Fetch did not succeed");
            }
        }).then((json) => {
            console.log('json',json);
			rate = json;
        })
        .catch((err) => {
            console.log(err);
        });
		return rate;
}