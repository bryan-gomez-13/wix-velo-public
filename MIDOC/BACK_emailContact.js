import { contacts, triggeredEmails } from 'wix-crm-backend';
import wixData from 'wix-data';

/* Sample emailToFind value:
 * 'zackary.sirko@example.com'
 */

export function createContact(emailFromFrontEnd, firstNamefromFrontEnd, lastNameFromFrontEnd, downloadLink) {
    const contactInfo = {
        name: {
            first: firstNamefromFrontEnd,
            last: lastNameFromFrontEnd
        },
        //profilePicture: "https://randomuser.me/api/portraits/men/0.jpg",
        emails: [{
            tag: "WORK",
            email: emailFromFrontEnd
        }],
    };

    return contacts.appendOrCreateContact(contactInfo)
        .then((contact) => {
            let contactID = contact.contactId;
            emailContactWithCertificate(contactID, firstNamefromFrontEnd, downloadLink)
            return contact;
        })
        .catch((error) => {
            console.error(error);
        });
}

export async function emailContactWithCertificate(contactID, name, downloadLink) {
    // FUNCTION YOURWEB

    const triggeredEmailTemplate = 'medicalCertificateEmail';
    let emailOptions = {
        variables: {
            name: name,
            downloadLink: downloadLink
        }
    }

    try {
        await triggeredEmails.emailContact(triggeredEmailTemplate, contactID, emailOptions);
        console.log(`Email sent to contact - ${name}`);
        getContactForMidoc(contactID)

    } catch (error) {
        console.error(error);
        console.log(error);

        const json = {
            jsonEmail: {
                'function': "emailContactWithCertificate",
                contactID,
                name,
                downloadLink
            },
            error
        }

        wixData.insert('CatchError', json, { suppressAuth: true, suppressHooks: true })
        // Handle the error
    }
}

export async function emailContactWithCertificateNew(contactID, name, downloadLink, emailType) {

    const triggeredEmailTemplate = 'approvedEmail';
    let emailOptions = {
        variables: {
            name: name,
            downloadLink: downloadLink,
            emailType: emailType
        }
    }

    try {
        await triggeredEmails.emailContact(triggeredEmailTemplate, contactID, emailOptions);
        console.log(`Email sent to contact - ${name}`);
        getContactForMidoc(contactID)

    } catch (error) {
        console.error(error);
        console.log(error);
        // Handle the error
    }
}

export async function emailRejectionCertificate(contactID, name) {

    const triggeredEmailTemplate = 'rejectionEmail';
    let emailOptions = {
        variables: {
            name: name
        }
    }

    try {
        await triggeredEmails.emailContact(triggeredEmailTemplate, contactID, emailOptions);
        console.log('Email sent to contact');
        getContactForMidoc(contactID)

    } catch (error) {
        console.error(error);
        console.log(error);
        // Handle the error
    }
}

export async function emailMemberWithCertificate(memberID, name, downloadLink) {
    const triggeredEmailTemplate = 'medicalCertificateEmail';
    let emailOptions = {
        variables: {
            name: name,
            downloadLink: downloadLink
        }
    }

    try {
        await triggeredEmails.emailMember(triggeredEmailTemplate, memberID, emailOptions);
        getContactForMidoc(memberID)
        console.log('Email sent to member');
    } catch (error) {
        console.error(error);
        console.log(error);
        // Handle the error
    }
}

export function getContactForMidoc(contactID) {

    const options = {
        suppressAuth: true
    };

    return contacts.getContact(contactID, options)
        .then((contact) => {
            let contactFirstName = contact.info.name.first;
            let contactLastName = contact.info.name.last;
            let contactEmail = contact.info.emails[0].email;
            emailMidoc(contactFirstName, contactLastName, contactEmail)

            //  return contact;
        })
        .catch((error) => {
            console.error(error);
        });

}
export async function emailMidoc(contactFirstName, contactLastName, contactEmail) {

    const triggeredEmailTemplate = 'midocCertificateEmail';
    const midocContactID = "9dbc854a-b3b2-49b6-b14a-7553148c76e4";

    let emailOptions = {
        variables: {
            firstName: contactFirstName,
            lastName: contactLastName,
            email: contactEmail
        }
    }

    try {
        await triggeredEmails.emailContact(triggeredEmailTemplate, midocContactID, emailOptions);
        console.log('Email sent to midoc email contact');
    } catch (error) {
        console.error(error);
        console.log(error);
        // Handle the error
    }
}

export async function queryContactForID(emailToFind) {
    console.log(emailToFind + " is the email to find")

    let options = {
        suppressAuth: true
    }

    let contactId;
    const queryResults = await contacts.queryContacts()
        .eq('info.emails.email', emailToFind)
        .find(options);

    const contactsWithEmail = queryResults.items;
    console.log(contactsWithEmail);

    if (contactsWithEmail.length > 0) {

        console.log('Found 1 contact');
        contactId = contactsWithEmail[0]._id;
        return contactId
        //emailContactWithCertificate(contactId, firstName, downloadLink)

    } else {

        console.log('No contacts found');
        return null
        // Handle when no contacts are found

    }
}

export async function queryContactForIDYourweb(emailToFind) {
    console.log(emailToFind + " is the email to find")

    let options = {
        suppressAuth: true
    }

    let contactId;
    const queryResults = await contacts.queryContacts()
        .eq('_id', emailToFind)
        .find(options);

    const contactsWithEmail = queryResults.items;
    console.log(contactsWithEmail);

    if (contactsWithEmail.length > 0) {

        console.log('Found 1 contact');
        contactId = contactsWithEmail[0]._id;
        return contactId
        //emailContactWithCertificate(contactId, firstName, downloadLink)

    } else {

        console.log('No contacts found');
        return null
        // Handle when no contacts are found

    }
}

export async function emailDoctor(item) {

    let doctorDBID = item.tempDoctorId;
    queryDoctorForContactID(doctorDBID)
        .then((doctorsList) => {

            //let doctorsContactID = doctorsList[0].doctorsId;
            const triggeredEmailTemplate = 'doctorsEmail';
            //const doctorContactID = "c0c893fa-fb92-4c58-a709-758f24417ff3"; //jaoshethna@gmail.com

            const doctorContactID = doctorsList[0].doctorsId; //"0228c326-f2b9-4f06-8282-b63c30b0511b"; //juan stephen@gmail.com

            let emailOptions = {
                variables: {
                    email: item.email,
                    dob: item.dob,
                    tillDate: item.tillDate,
                    lastName: item.lastName,
                    firstName: item.firstName,
                    guardianLastName: item.guardianLastName,
                    fromDate: item.fromDate,
                    symptom: item.medicalSymptom,
                    address: item.address,
                    needsCertificateFor: item.medicalNeedFor,
                    guardianFirstName: item.guardianFirstName,
                    phone: item.phone
                }
            }
            triggeredEmails.emailContact(triggeredEmailTemplate, doctorContactID, emailOptions);

        })
        .catch((err) => {
            console.log(err);
        });

}

export async function emailDoctorNew(item, dbName) {
    let typeOfCertificateOption;
    let doctorDBID = item.tempDoctorId;
    queryDoctorForContactID(doctorDBID)
        .then((doctorsList) => {

            //let doctorsContactID = doctorsList[0].doctorsId;
            const triggeredEmailTemplate = 'doctorsEmailNew';
            //const doctorContactID = "c0c893fa-fb92-4c58-a709-758f24417ff3"; //jaoshethna@gmail.com
            const doctorContactID = doctorsList[0].doctorsId; //"0228c326-f2b9-4f06-8282-b63c30b0511b"; //juan stephen@gmail.com

            if (dbName === "finalDatabase-ReferralCertificate") {
                typeOfCertificateOption = `Referral Certificate`
            } else if (dbName === "MainCertificateDatabase") {
                typeOfCertificateOption = `Medical Certificate`
            } else if (dbName === "FinalDatabase-ScriptCertificate") {
                typeOfCertificateOption = `Script Certificate`
            }

            let emailOptions = {
                variables: {
                    email: item.email,
                    dob: item.dob,
                    lastName: item.lastName,
                    firstName: item.firstName,
                    address: item.address,
                    typeOfCertificate: typeOfCertificateOption,
                    phone: item.phone
                }
            }
            triggeredEmails.emailContact(triggeredEmailTemplate, doctorContactID, emailOptions);
            console.log(`email sent to doctor for ${typeOfCertificateOption}`)
        })
        .catch((err) => {
            console.log(err);
        });

}

export async function queryDoctorForContactID(doctorDBID) {

    let options = {
        suppressAuth: true
    }

    return wixData.query("DoctorsDatabase")
        .eq("_id", doctorDBID)
        .find(options)
        .then((results) => {
            if (results.items.length > 0) {
                let doctorsList = results.items;
                return doctorsList;
            } else {
                console.log(" no doctors available in doctors DB");
                return [];
            }
        })
        .catch((err) => {
            console.log(err);
            return []; // Return an empty array in case of an error
        });

}

export function sendEmailtoClayDirectly(itemData, doctorsList) {
    let emailOptions;

    const triggeredEmailTemplate = 'directScriptEmail';
    const midocContactID = "9dbc854a-b3b2-49b6-b14a-7553148c76e4"; //actual id for midoc
    //   const midocContactID = "92b169d3-4b8f-40fc-bfe8-bdad027d3e86"; // test id for jasoh

    if ((itemData.scriptType === "New Script") || (itemData.scriptType === "I Need Antibiotics")) {
        emailOptions = {
            variables: {
                email: itemData.email,
                dob: itemData.dob,
                lastName: itemData.lastName,
                firstName: itemData.firstName,
                address: itemData.address,
                phone: itemData.phone,
                scriptText1: `\n New Medication Name: ${itemData.newMedicationName} \n  New Medication Dosage: ${itemData.newMedicationDosage} \n New Medication Frequency: ${itemData.newMedicationFrequency}`,
                scriptType: itemData.scriptType

            }
        }
    } else if (itemData.scriptType === "Repeat Script") {
        emailOptions = {
            variables: {
                email: itemData.email,
                dob: itemData.dob,
                lastName: itemData.lastName,
                firstName: itemData.firstName,
                address: itemData.address,
                phone: itemData.phone,
                scriptText1: `\n Medication Category: ${itemData.medicationCategory} \n  Medication Repeat Dosage: ${itemData.repeatDosage} \n Unlisted Dosage: ${itemData.unlistedDosage}`,
                scriptType: itemData.scriptType
            }
        }
    }

    triggeredEmails.emailContact(triggeredEmailTemplate, midocContactID, emailOptions)
        .then(() => {
            console.log(`email sent to clay for ${itemData.scriptType}`)
        })
        .catch((error) => {
            console.log(error);
        });

}