import { Permissions, webMethod } from "wix-web-module";
import { triggeredEmails } from "wix-crm-backend";

export const sendEmail = webMethod(Permissions.Anyone, async (json) => {
    const emailId = "emailOffer";

    // Validate that 'json' is a non-empty array
    if (!Array.isArray(json) || json.length === 0) {
        console.error("Invalid input: 'json' must be a non-empty array.");
        return false;
    }

    // Filter out any invalid entries (missing privateId or variables)
    const validRecipients = json.filter(item => item.privateId && item.variables);

    // If no valid recipients are found, return early
    if (validRecipients.length === 0) {
        console.error("No valid recipients found.");
        return false;
    }

    try {
        // Send all emails in parallel using Promise.all()
        await Promise.all(validRecipients.map(({ privateId, variables }) =>
            triggeredEmails.emailMember(emailId, privateId, { variables })
            .then(() => console.log(`Email sent to member ${privateId}`))
            .catch((error) => console.error(`Error sending email to ${privateId}:`, error))
        ));

        return true; // Return true if all emails are processed successfully
    } catch (error) {
        console.error("Unexpected error while sending emails:", error);
        return false;
    }
});

export const emailForBroker = webMethod(Permissions.Anyone, async (json) => {
    const emailId = "emailForBroker";
    try {
        triggeredEmails.emailContact(emailId, json.privateId, { variables: json.variables })
            .then(() => console.log(`Email sent to member`))
            .catch((error) => console.error(`Error sending email to:`, error))

        return true; // Return true if all emails are processed successfully
    } catch (error) {
        console.error("Unexpected error while sending emails:", error);
        return false;
    }
});