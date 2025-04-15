import { getNotificationsEmails } from 'backend/collections.web.js';
import { Permissions, webMethod } from "wix-web-module";
import { triggeredEmails } from "wix-crm-backend";

export const sendBeatByEmailForPurchase = webMethod(Permissions.Anyone, async (purchaseInfo) => {
    try {
        const emailIdPurchase = 'emailForPersonWhoPurchaseTheBeat';
        const emailIdOwner = 'emailForTheOwner';
        const memberIdPurchase = purchaseInfo.contactId;

        const optionsPurchase = {
            variables: {
                beatName: purchaseInfo.beatName,
                licence: purchaseInfo.licence,
                price: purchaseInfo.price,
                contactName: purchaseInfo.contactName,
                urlDownloadBeat: purchaseInfo.urlDownloadBeat,
            }
        };

        const optionsOwner = {
            variables: {
                orderNumber: purchaseInfo.orderNumber,
                beatName: purchaseInfo.beatName,
                contactName: purchaseInfo.contactName,
                contactEmail: purchaseInfo.contactEmail,
                datePurchase: purchaseInfo.dateToPurchase,
                urlOrder: purchaseInfo.orderUrl,
            }
        };

        // Send Email Customer
        await sendEmail(emailIdPurchase, memberIdPurchase, optionsPurchase);

        // Send Email admin
        const emailsToSendNotifications = await getNotificationsEmails();
        await Promise.all(
            emailsToSendNotifications.map(emailOwner => {
                sendEmail(emailIdOwner, emailOwner, optionsOwner)
            })
        );

        console.log("All emails sent successfully!");

    } catch (error) {
        console.error("Error sending emails:", error);
    }
});

// Send Emails
async function sendEmail(emailId, memberId, options) {
    try {
        await triggeredEmails.emailMember(emailId, memberId, options);
        console.log(`Email sent to: ${memberId}`);
    } catch (error) {
        console.error(`Failed to send email to ${memberId}:`, error);
    }
}