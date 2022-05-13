import wixData from 'wix-data';
import { authentication } from 'wix-members-backend';

export async function approveBy3rdParty(email, password, options, json) {
    await authentication.register(email, password, options)
        .then(async (registrationResult) => {
            await wixData.insert("UserDatabase", json);
        })
        .catch((error) => {
            console.error(error);
        })
}