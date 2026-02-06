import { Permissions, webMethod } from "wix-web-module";
import { getBestBeforeEmailsNotifications } from 'backend/collections.web.js';
import { triggeredEmails } from "wix-crm-backend";
import { contacts } from "wix-crm-backend";

export const sendBestBeforeEmail = webMethod(Permissions.Anyone, async (list, inventory) => {
    const membersId = await getBestBeforeEmailsNotifications();

    const emailId = "emailBestBefore";
    const options = {
        variables: {
            list: list,
            days: inventory,
        },
    };

    // Send emails to all members concurrently and wait for all to finish
    await Promise.all(
        membersId.map(memberId =>
            triggeredEmails.emailMember(emailId, memberId, options)
            .then(() => { console.log(`Email sent to member ${memberId}`); })
            .catch((error) => { console.error(`Failed to send email to member ${memberId}:`, error); })
        )
    );
});

// Send Parcel Locker
export const sendEmailNotifications = webMethod(Permissions.Anyone, async (json) => {
    try {
        if (json.shippingInfo.title.includes('Parcel Locker')) {
            const emailId = 'emailParcelLocker';
            const contactEmail = json.contact.contactId;
            const options = { variables: { linkParcelLocker: `https://www.latienda.ee/thank-you-page/${json._id}` } };

            return triggeredEmails.emailContact(emailId, contactEmail, options)
                .then(() => { console.log(`Email sent to member: ${contactEmail}`); })
                .catch((error) => { console.error(`Error sending email to member ${contactEmail}:`, error); });
        }
    } catch (err) {
        console.error("Unexpected error sending emails:", err);
        return { success: false, error: err.message };
    }
})