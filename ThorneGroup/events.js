// Contact Created
import wixData from 'wix-data';
import { contacts } from 'wix-crm-backend';
import { email } from 'backend/ThorneGroup.jsw'

export async function wixCrm_onContactCreated(event) {

    //console.log(event)
    let labelkeys = ["custom.subscription"]
    await wixData.query("paymentForm052")
        .eq('email', event.entity.primaryInfo.email)
        .descending('_createdDate')
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                if (results.items[0].checkboxField == true) labelkeys.push("custom.site-evaluation")
                if (results.items[0].checkboxField2 == true) labelkeys.push("custom.desing-inspirations")
                if (results.items[0].checkboxField3 == true) labelkeys.push("custom.house-land")
            } else {
                console.log('Nonas')
            }
        })
        .catch((err) => {
            console.log(err)
        });

    const contactIdentifiers = {
        contactId: event.metadata.entityId,
        revision: event.entity.revision + 1
    };
    const contactInfo = {
        labelKeys: labelkeys
    };
    const options = {
        allowDuplicates: false,
        suppressAuth: true
    };

    //console.log('UPDATE-1', contactIdentifiers, contactInfo)

    return contacts.updateContact(contactIdentifiers, contactInfo, options)
        .then((updatedContact) => {
            return updatedContact;
        })
        .catch((error) => {
            console.error(error);
        });

}

// WIX FORM - START YOUR JOURNEY HERE - Send email with magazine
export function wixCrm_onFormSubmit(event) {
    console.log(event);
    //console.log(event.submissionData[4].fieldValue);
    let x = 0;
    for (let i = 0; i < event.submissionData.length; i++) {
        if(event.submissionData[i].fieldName == "Request an on-line copy of our latest Thorne Group magazine."){
            x = i;
            break;
        }
    }
    if (event.formName == "Find Your Perfect Match" && event.submissionData[x].fieldValue == "Checked") email(event.contactId);
}