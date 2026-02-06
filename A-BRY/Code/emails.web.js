import { Permissions, webMethod } from "wix-web-module";
import { triggeredEmails } from "wix-crm-backend";
import { contacts } from "wix-crm-backend";

export const sendEmailNotifications = webMethod(Permissions.Anyone, async (email, json) => {
    try {
        const emailId = 'customFormNotification';
        const contactEmail = await getEmailNotifications(email, json.firstName);
        const options = { variables: json };

        return triggeredEmails.emailContact(emailId, contactEmail, options)
            .then(() => { console.log(`Email sent to member: ${contactEmail}`); })
            .catch((error) => { console.error(`Error sending email to member ${contactEmail}:`, error); });

    } catch (err) {
        console.error("Unexpected error sending emails:", err);
        return { success: false, error: err.message };
    }
})

export const getEmailNotifications = webMethod(Permissions.Anyone, async (email, firstName) => {
    try {
        const queryResults = await contacts.queryContacts().eq('primaryInfo.email', email).find({ suppressAuth: true });
        if (queryResults.items.length > 0) {
            return queryResults.items[0]._id
        } else {
            const contactInfo = {
                name: { first: firstName },
                emails: [{ email: email, primary: true }]
            };
            const options = { allowDuplicates: false, suppressAuth: true, };

            return contacts.createContact(contactInfo, options)
                .then((contact) => { return contact._id; })
        }
    } catch (error) { console.error(error) }
});