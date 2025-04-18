import { Permissions, webMethod } from "wix-web-module";
import { getContacts, saveContactUs } from 'backend/collections.web.js'
import { triggeredEmails } from "wix-crm-backend";
import { contacts } from "wix-crm-backend";

export const contactUsEmail = webMethod(Permissions.Anyone, async (json, link) => {
    console.log("json",json)
    console.log("link",link)
    json.link = "https://manage.wix.com/dashboard/c212321d-0f99-420f-800e-989181ff8392/database/data/ContactUs/" + link;
    let options = { variables: json }

    getContacts().then((emails) => {
        emails.forEach((email) => {
            triggeredEmails.emailMember("contactUs", email, options).then(() => {
                console.log("Email was sent to member");
            }).catch((error) => { console.error(error); });
        })
    });
    infoContacts(json);
});

export const infoContacts = webMethod(Permissions.Anyone, (json) => {
    queryContact(json.email).then((contactInfo) => {
        if (contactInfo.length > 0) updateContact(contactInfo[0], json);
        else createContact(json);
    })
})

export const createContact = webMethod(Permissions.Anyone, (json) => {
    const contactInfo = {
        name: {
            first: json.firstName,
            last: json.lastName,
        },
        emails: [{
            tag: "HOME",
            email: json.email,
            primary: true,
        }, ],
        phones: [{
            tag: "MOBILE",
            phone: json.phone,
            primary: true,
        }, ],
        labelKeys: ["custom.contact-us"],
        extendedFields: {
            "custom.form": "Contact Us",
        }
    };

    const options = {
        allowDuplicates: false,
        suppressAuth: true,
    };

    return contacts.createContact(contactInfo, options)
        .then((contact) => { return contact; })
        .catch((error) => { console.error(error); });
});

export const updateContact = webMethod(Permissions.Anyone, async (contact, json) => {

    const contactIdentifiers = {
        contactId: contact._id,
        revision: contact.revision++,
    };

    let labelKeys;
    if (contact.info.labelKeys) labelKeys = contact.info.labelKeys;
    else labelKeys = [];
    labelKeys.push("custom.contact-us")

    const contactInfo = {
        labelKeys: labelKeys,
        extendedFields: { "custom.form": "Contact Us" }
    };

    const options = {
        allowDuplicates: false,
        suppressAuth: true,
    };

    return await contacts.updateContact(contactIdentifiers, contactInfo, options)
        .then((updatedContact) => { return updatedContact })
        .catch((error) => { console.error(error) });
});

export const queryContact = webMethod(Permissions.Anyone, async (email) => {
    try {
        const queryResults = await contacts.queryContacts().eq("primaryInfo.email", email).find({ suppressAuth: true });
        return queryResults.items;
    } catch (error) { console.error(error) }
})