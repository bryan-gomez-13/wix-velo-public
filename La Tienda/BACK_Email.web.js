import { Permissions, webMethod } from "wix-web-module";
import { getBestBeforeEmailsNotifications } from 'backend/collections.web.js';
import { triggeredEmails } from "wix-crm-backend";

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