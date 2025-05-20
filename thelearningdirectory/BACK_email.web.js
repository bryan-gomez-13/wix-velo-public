import { Permissions, webMethod } from "wix-web-module";
import { getEmail } from 'backend/collections.web.js'
import { triggeredEmails } from 'wix-crm-backend';

// Banner
export const eMail = webMethod(Permissions.Anyone, async (json) => {
    const options = {
        variables: {
            Page: json.Page,
            Company: json.Company,
            Name: json.Name,
            Email: json.Email,
            Phone: json.Phone,
            link: json.link
        }
    }
    getEmail().then((emails) => {
        emails.forEach((emailId) => {
            triggeredEmails.emailMember("banner", emailId, options).then(() => { console.log("Email Done") })
                .catch((error) => { console.error(error); });
        })
    })
})

// Clubs & Groups
export const eMailClubs = webMethod(Permissions.Anyone, async (json) => {
    const options = {
        variables: {
            Name: json.Name,
            Email: json.Email,
            Phone: json.Phone,
            Website: json.Website,
            link: json.link
        }
    }
    getEmail().then((emails) => {
        emails.forEach((emailId) => {
            triggeredEmails.emailMember("ClubsAndGroups", emailId, options).then(() => { console.log("Email Done") })
                .catch((error) => { console.error(error); });
        })
    })
})