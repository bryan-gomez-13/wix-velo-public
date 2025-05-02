import { Permissions, webMethod } from "wix-web-module";
import { generalQuery } from 'backend/collections.web.js';
import { contacts } from "wix-crm-backend";
import { elevate } from "wix-auth";
import { emailForBroker } from 'backend/email.web.js';

export const sendEmailForBroker = webMethod(Permissions.Anyone, async (json) => {
    const boatInfo = (await generalQuery('BoatsForSale2', 'boatCode', json.subject)).items[0];
    const brokerInfo = (await generalQuery('Meetourbrokers', '_id', boatInfo.broker)).items[0];
    const variables = {
        boatName: boatInfo.title,
        brokerName: brokerInfo.title,
        name: json.name,
        email: json.email,
        phone: json.phone,
        boatCode: json.subject,
        message: json.message,
        boatLink: `https://www.parkermarinegroup.co.nz${boatInfo["link-boats-for-sale2-title"]}`
    }

    const privateId = await getEmailInfo(brokerInfo.email);
    const jsonToSendEmail = { variables, privateId }

    emailForBroker(jsonToSendEmail);
});

export const getEmailInfo = webMethod(Permissions.Anyone, async (emailToFind) => {
    const queryElevate = elevate(contacts.queryContacts)
    const queryResults = await queryElevate().eq("info.emails.email", emailToFind).find();
    return queryResults.items[0]._id
}, );