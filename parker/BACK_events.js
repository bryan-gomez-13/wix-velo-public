import { sendEmailForBroker } from 'backend/functions.web.js';

export function wixCrm_onFormSubmit(event) {
    if (event.formName == "Contact Boat For Sale") {
        const name = event.submissionData.find(item => item.fieldName == "Name").fieldValue;
        const email = event.submissionData.find(item => item.fieldName == "Email").fieldValue;
        const phone = event.submissionData.find(item => item.fieldName == "Phone").fieldValue;
        const subject = event.submissionData.find(item => item.fieldName == "Subject").fieldValue;
        const message = event.submissionData.find(item => item.fieldName == "Message").fieldValue;

        const json = { name, email, phone, subject, message }

        sendEmailForBroker(json)
    }
}