import { Permissions, webMethod } from "wix-web-module";
import { getCollection, generalQuery2, updateCollection } from 'backend/collections.web.js';
import { triggeredEmails } from "wix-crm-backend";

export const emailForms = webMethod(Permissions.Anyone, async (json) => {
    const emailNotifications = (await getCollection('FormNotifications')).map(item => item.memberId);
    const emailId = 'emailForm';

    const options = {
        variables: {
            formName: json.formName,
            name: json.name,
            data: json.data,
            urlWix: json.urlWix
        }
    };

    await sendEmail(emailNotifications, emailId, options)
    return true;
});

export const emailAdditionalInformation = webMethod(Permissions.Anyone, async (json) => {
    const emailNotifications = [json.emailId];
    const emailId = 'emailAdditionalInformation';

    const options = {
        variables: {
            subject: json.subject,
            message: json.message,
            urlWix: `https://yourwebnz.wixsite.com/afcacademy/additional-information?formId=${json.formId}`,
            btLabel: 'Upload Additional Information'
        }
    };

    await sendEmail(emailNotifications, emailId, options);
    return true;
});

export const emailAdditionalInformationAdmin = webMethod(Permissions.Anyone, async (json) => {
    const validationEmail = await generalQuery2('Formssubmitted', '_id', json.submission, 'sendEmailAdditionalInformation', false);
    if (validationEmail.length > 0) {
        let item = validationEmail[0];
        item.sendEmailAdditionalInformation = true;

        const emailNotifications = (await getCollection('FormNotifications')).map(item => item.memberId);
        const emailId = 'emailAdditionalInformationAdmin';

        const options = {
            variables: {
                userName: json.userName,
                email: json.email,
                formName: json.formName
            }
        };

        await sendEmail(emailNotifications, emailId, options);
        await updateCollection('Formssubmitted', item)
        return true;
    }
});

async function sendEmail(emailNotifications, emailId, options) {
    try {

        const sendPromises = emailNotifications.map((memberId) => {
            return triggeredEmails.emailMember(emailId, memberId, options)
                .then(() => { console.log(`Email sent to member: ${memberId}`); })
                .catch((error) => { console.error(`Error sending email to member ${memberId}:`, error); });
        });

        // Wait for all emails to be processed (sent or failed)
        await Promise.all(sendPromises);

        return { success: true, message: "Emails processed" };

    } catch (err) {
        console.error("Unexpected error sending emails:", err);
        return { success: false, error: err.message };
    }
}