import wixData from "wix-data";
import { triggeredEmails } from 'wix-crm-backend';
import { Permissions, webMethod } from 'wix-web-module';

export async function sendSalesEnquiry(jsonEmail) {
    console.log("sendSalesEnquiry", jsonEmail)
    let idGeneralEnquiries = await getEmailSalesEnquiry('General Enquiries');
    //let idUser = await getEmailSalesEnquiry(jsonEmail.region);
    let idUser = await getEmailSalesEnquiry("Yourweb");

    //idUser = yourweb
    let emailId = "salesEnquiry";
    const options = { variables: jsonEmail }

    await sendMember(emailId, idUser, options);
    await sendContact(emailId, idUser, options);
}

export const sendMember = webMethod(Permissions.Anyone, async (emailId, idUser, options) => {
    return await triggeredEmails.emailMember(emailId, idUser, options).then(() => console.log('Member'))
        .catch((error) => { console.error("error M", error) });
});

export const sendContact = webMethod(Permissions.Anyone, async (emailId, idUser, options) => {
    return await triggeredEmails.emailContact(emailId, idUser, options).then(() => console.log('Contact'))
        .catch((error) => { console.error("error C", error) });
});

export async function getEmailSalesEnquiry(region) {
    return wixData.query('RegionCountry').eq('title', region).find().then((results) => {
        return results.items[0].privateId;
    })
}