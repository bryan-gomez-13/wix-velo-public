import { Permissions, webMethod } from "wix-web-module";
import { getEventInfo } from 'backend/functions.web.js';
import { triggeredEmails } from "wix-crm-backend";

export const emailRSVPs = webMethod(Permissions.Anyone, (eventInfo, jsonToInsert) => {
    const emailId = "emailRegister";
    const contactId = eventInfo.contactId;
    getEventInfo(eventInfo.eventId).then((allEventInfo) => {
        const options = {
            variables: {
                firstName: jsonToInsert.firstName,
                eventName: jsonToInsert.eventName,
                eventDate: jsonToInsert.eventDate,
                email: jsonToInsert.email,
                google: allEventInfo.calendarLinks.google,
                addToIcs: allEventInfo.calendarLinks.ics,
                eventLocation: jsonToInsert.eventLocation
            }
        }
        triggeredEmails.emailContact(emailId, contactId, options).then(() => {
            console.log("Email was sent to contact");
        }).catch((error) => { console.error(error) });
    })
});