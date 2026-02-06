import { Permissions, webMethod } from "wix-web-module";
import { getCollection, generalQuery2, updateCollection, getNotificationEmails } from 'backend/collections.web.js';
import { triggeredEmails } from "wix-crm-backend";
import { getEmail } from 'backend/functions.web.js';

const baseUrlWix = 'https://registration.afcacademy.com/'

export const emailForms = webMethod(Permissions.Anyone, async (json) => {
    const emailNotifications = await getNotificationEmails();
    const emailId = 'emailForm';

    const options = {
        variables: {
            formName: json.formName,
            name: json.name,
            data: json.data,
            urlAdmin: json.urlAdmin,
            urlApplication: json.urlApplication
        }
    };

    await sendEmailNotifications(emailNotifications, emailId, options)
    return true;
});

export const emailSignRequired = webMethod(Permissions.Anyone, async (json, urlWix) => {
    const emailId = 'documentSignRequired';
    const emailNotifications = await getEmail(json)

    const options = {
        variables: {
            urlSignDocument: urlWix
        }
    };

    await sendEmail([emailNotifications], emailId, options)

    triggeredEmails.emailContact(emailId, emailNotifications, options)
        .then(() => { console.log(`Email sent to member: ${emailNotifications}`); })
        .catch((error) => { console.error(`Error sending email to member ${emailNotifications}:`, error); });
    return true;
});

export const emailPhysicalSignature = webMethod(Permissions.Anyone, async (json, applicationPDF, baseUrl) => {
    const emailId = 'downloadDocument';
    const emailNotifications = json.memberId;

    const options = {
        variables: {
            linkUploadDocument: applicationPDF,
            applicationPDF: json.pdf,
            baseUrl: baseUrl
        }
    };

    await sendEmail([emailNotifications], emailId, options)

    // triggeredEmails.emailContact(emailId, emailNotifications, options)
    //     .then(() => { console.log(`Email sent to member: ${emailNotifications}`); })
    //     .catch((error) => { console.error(`Error sending email to member ${emailNotifications}:`, error); });
    return true;
});

export const sendEmailSignature = webMethod(Permissions.Anyone, async (urlWix) => {
    const emailNotifications = await getNotificationEmails();
    const emailId = 'applicationSigned';

    const options = { variables: { urlWix: urlWix } };

    await sendEmailNotifications(emailNotifications, emailId, options)
    return true;
});

export const emailAdditionalInformation = webMethod(Permissions.Anyone, async (json) => {
    const emailNotifications = [json.emailId];
    const emailId = 'emailAdditionalInformation';

    const options = {
        variables: {
            subject: json.subject,
            message: json.message,
            urlWix: `https://registration.afcacademy.com/additional-information?formId=${json.formId}`,
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

        const emailNotifications = await getNotificationEmails();
        const emailId = 'emailAdditionalInformationAdmin';

        const options = {
            variables: {
                userName: json.userName,
                email: json.email,
                formName: json.formName,
                urlWix: `${baseUrlWix}/admin?formId=${json.submission}`,
                folderDownloadUrl: json.folderDownloadUrl
            }
        };

        await sendEmailNotifications(emailNotifications, emailId, options);
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

async function sendEmailNotifications(emailNotifications, emailId, options) {
    try {

        const sendPromises = emailNotifications.map((memberId) => {
            return triggeredEmails.emailContact(emailId, memberId, options)
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