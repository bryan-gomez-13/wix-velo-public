import wixData from 'wix-data';
import {eMail_1, eMail_4} from 'backend/emails'
import { authentication } from 'wix-members-backend';

export async function approveBy3rdParty(email, password, options, json) {
    await authentication.register(email, password, options)
        .then(async (registrationResult) => {
            json.idPrivateMember = registrationResult.member._id
            await wixData.insert("Members", json);
            console.log("Done")
        })
        .catch((error) => {
            console.error(error);
        })
}