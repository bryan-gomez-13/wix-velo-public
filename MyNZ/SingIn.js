import wixData from 'wix-data';
import {eMail_1, eMail_4} from 'backend/emails'
import { authentication } from 'wix-members-backend';

export async function approveBy3rdParty(email, password, options, json) {
    await authentication.register(email, password, options)
        .then(async (registrationResult) => {
            json.idPrivateMember = registrationResult.member._id
            await wixData.insert("Users", json);
            await eMail_4(json)
            await eMail_1(json.email);
        })
        .catch((error) => {
            console.error(error);
        })
}