import { fetch } from 'wix-fetch';
import wixSecretsBackend from 'wix-secrets-backend';
import { mediaManager } from 'wix-media-backend';
import wixData from 'wix-data';
import { NewRegisterMemberFunction, getLoggedInMemberDetails, NewContactRegistration, getContactDetails, checkIfExistingMember } from 'backend/registration.jsw'
import { emailContactWithCertificate, emailRejectionCertificate, createContact, emailMemberWithCertificate, queryContactForID, emailDoctor, emailContactWithCertificateNew } from 'backend/emailContact.jsw';
import { getDownloadUrl } from 'backend/Yourweb/functions.web.js';

import { changeDateToString } from 'backend/dateChanger.jsw';

let memberID

export async function getTemplates() {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    return fetch("https://api.craftmypdf.com/v1/list-templates?limit=300&offset=0", {
            "method": 'GET',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            }
        })
        .then(response => response.json())
        .then(json => {
            var options = [];
            (json.templates).forEach((template) => {

                options.push({
                    value: template.template_id,
                    label: template.name
                });
            })
            return options
        });

}

export async function getPDF(template_id, data) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": data,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            return json.file
        });

}

export function uploadFile(url, name) {
    return mediaManager.importFile(
        "/allMedicalCertificates",
        url, {
            "mediaOptions": {
                "mimeType": "application/pdf",
                "mediaType": "document"
            },
            "metadataOptions": {
                "fileName": `${name}_medical_certificate.pdf`
            }
        }
    );
}

export async function generatePDF(template_id, data, item, toCreateMember, guestLogin, alreadyMember, toRegister) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": data,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, item.firstName)
                .then((fileDetails) => {
                    console.log(fileDetails.fileUrl)
                    let dataUpdateOptions = {
                        "suppressAuth": true
                    };

                    wixData.get("MedicalCertificateData", item._id)
                        .then((item) => {
                            item.medicalCertificate = fileDetails.fileUrl; // updated last name
                            wixData.update("MedicalCertificateData", item, dataUpdateOptions);
                            console.log(item); //see item below

                            let downloadLink = `https://f45dfa2f-60d1-4224-b07e-5cff48ca8f76.usrfiles.com/ugd/${fileDetails.fileName}`;
                            /*
                            //GENERATE TRIGGERED EMAIL
                            if (toCreateMember) {
                                NewRegisterMemberFunction(toRegister)
                                    .then((registrationResult) => {
                                        console.log(registrationResult);
                                        memberID = registrationResult.member._id
                                        console.log("result successful in newregister-member-fuccntion");
                                        console.log("emailing new member");
                                        //   emailContactWithCertificate(memberID, item.firstName, downloadLink)
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            } else if (guestLogin) {
                                NewContactRegistration(toRegister)
                                    .then((registrationResult) => {
                                        console.log(registrationResult);
                                        memberID = registrationResult._id;
                                        console.log("emailing new contact");
                                        // emailContactWithCertificate(memberID, item.firstName, downloadLink)
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            } else if (guestLogin != true) {
                                console.log("emailing member direclty");

                                //queryContactForID(item.email, item.firstName, downloadLink)

                            }
                            */

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
        });

    /*
    //JUST registering the contact or member. NOT generating anything

    if (toCreateMember) {
        NewRegisterMemberFunction(toRegister)
            .then((registrationResult) => {
                //msgBoxRegisterState("Member Registered. Please wait...", largerTimeOutValue);
                console.log(registrationResult);
                memberID = registrationResult.member._id
                //loginNewMember($w('#emailInput').value, $w('#passwordInput').value)
                console.log("regsstered new logged in member");
                //emailContactWithCertificate(memberID, item.firstName, downloadLink)
            })
            .catch((error) => {
                console.log(error);
            });
    } else if (guestLogin) {
        NewContactRegistration(toRegister)
            .then((registrationResult) => {
                console.log(registrationResult);
                memberID = registrationResult._id;
                console.log("registered new contact");
            })
            .catch((error) => {
                console.log(error);
            });
    } else if (guestLogin != true) {
        console.log("emailing member direclty");
    }
    */
}

export async function sendCertificateToPatient(updatedItem, doctorsList) {

    const doctorContactID = doctorsList[0].doctorsId;
    const doctorName = doctorsList[0].doctorsName;
    const doctorProviderNumber = doctorsList[0].doctorProviderNumber;
    const doctorQualification = doctorsList[0].doctorQualification;
    const doctorSignature = doctorsList[0].doctorSignature;
    const doctorAphraNumber = doctorsList[0].doctorahpraNumber;
    const newDoctorSignature = doctorSignature.replace("wix:image://v1/", "https://static.wixstatic.com/media/");

    // Remove everything after '.png' (including '.png')
    const finalDoctorSignature = newDoctorSignature.split('.png')[0] + '.png';

    let nameofCaredPerson;

    // Now finalDoctorSignature contains the modified URL
    console.log(`Final doctor url is ${finalDoctorSignature}`);

    let differentCertificateReason;
    let convDate = updatedItem._updatedDate.toDateString();

    //let createdDateString = await changeDateToString(convDate, -600)
    let createdDateString = await changeDateToString(updatedItem._updatedDate, -600)
    //let createdDateString = await changeDateToString2(convDate, userTimeZoneOffsetMinutes)
    console.log(`Formatted CreatedDate String in generate certificate backend is ${createdDateString}`); // Output: "10/08/2023"

    if (updatedItem.approvedStatus === true) {
        console.log("patient was approved. generated PDF");

        var template_id = "f1777b2375d3ddfc"; //"f7c77b237b1e7fd2"; //"78c77b237bad3f5c"; //"ff177b2b2cd2e52c";

        if (updatedItem.typeOfCertificate === "Carer") {
            if (updatedItem.numberOfDaysChosen === "Single Day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice requires ${updatedItem.typeOfCertificate} leave on ${updatedItem.fromDate}`;
                nameofCaredPerson = `Caring for: ${updatedItem.nameofCaredPerson}`;
            } else if (updatedItem.numberOfDaysChosen === "Multi-day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice requires ${updatedItem.typeOfCertificate} leave from ${updatedItem.fromDate} to and including ${updatedItem.tillDate}.`;
                nameofCaredPerson = `Caring for: ${updatedItem.nameofCaredPerson}`;
            }

        } else if (updatedItem.typeOfCertificate === "Medical") { //basically Medical

            if (updatedItem.numberOfDaysChosen === "Single Day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice is suffering from a medical condition which renders them unfit for: ${updatedItem.medicalNeedFor} on ${updatedItem.fromDate}`;
            } else if (updatedItem.numberOfDaysChosen === "Multi-day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice is suffering from a medical condition which renders them unfit for: ${updatedItem.medicalNeedFor} from ${updatedItem.fromDate} to and including ${updatedItem.tillDate}.`;
            }
        }
        console.log(differentCertificateReason + "is the reaason ");

        var pdfData = {
            "first_name": updatedItem.firstName,
            "last_name": updatedItem.lastName,
            "dateOfBirth": updatedItem.dob, //.toLocaleDateString('en-GB'),
            //"medicalReason": item.medicalNeedFor,
            "nameofCaredPerson": nameofCaredPerson,
            "medicalSymptom": updatedItem.medicalSymptom,
            "fromDate": updatedItem.fromDate,
            "tillDate": updatedItem.tillDate,
            "certificateID": updatedItem._id,
            "report_date": createdDateString,
            "certificateReason": differentCertificateReason,
            "address": updatedItem.address,
            "doctorName": doctorName,
            "doctorQualification": doctorQualification,
            "doctorProviderNumber": doctorProviderNumber,
            "doctorSign": finalDoctorSignature,
            "doctorAphraNumber": doctorAphraNumber

        }

        await generatePDFnew(template_id, pdfData, updatedItem)

    } else if (updatedItem.rejectedStatus === true) {

        console.log("patient was rejected. don't generate PDF");
        //var template_id = "f1777b2375d3ddfc"; //"f7c77b237b1e7fd2"; //"78c77b237bad3f5c"; //"ff177b2b2cd2e52c";

        // if (updatedItem.personID) {
        //     emailRejectionCertificate(updatedItem.personID, updatedItem.firstName)
        // } else if (!updatedItem.personID) {
        queryContactForID(updatedItem.email)
            .then((contactID) => {
                emailRejectionCertificate(contactID, updatedItem.firstName)

            })
        // }

    }

}

export async function sendCertificateToPatientYourweb(updatedItem, doctorsList) {
    console.log("YOURWEB", updatedItem, doctorsList)

    const doctorContactID = doctorsList[0].doctorsId;
    const doctorName = doctorsList[0].doctorsName;
    const doctorProviderNumber = doctorsList[0].doctorProviderNumber;
    const doctorQualification = doctorsList[0].doctorQualification;
    const doctorSignature = doctorsList[0].doctorSignature;
    const doctorAphraNumber = doctorsList[0].doctorahpraNumber;
    const newDoctorSignature = doctorSignature.replace("wix:image://v1/", "https://static.wixstatic.com/media/");

    // Remove everything after '.png' (including '.png')
    const finalDoctorSignature = newDoctorSignature.split('.png')[0] + '.png';

    let nameofCaredPerson;

    // Now finalDoctorSignature contains the modified URL
    console.log(`Final doctor url is ${finalDoctorSignature}`);

    let differentCertificateReason;
    let date = new Date(updatedItem._updatedDate)
    let convDate = date.toDateString();

    //let createdDateString = await changeDateToString(convDate, -600)
    let createdDateString = await changeDateToString(date, -600)
    //let createdDateString = await changeDateToString2(convDate, userTimeZoneOffsetMinutes)
    console.log(`Formatted CreatedDate String in generate certificate backend is ${createdDateString}`); // Output: "10/08/2023"

    if (updatedItem.approvedStatus === true) {
        console.log("patient was approved. generated PDF");

        var template_id = "f1777b2375d3ddfc"; //"f7c77b237b1e7fd2"; //"78c77b237bad3f5c"; //"ff177b2b2cd2e52c";

        if (updatedItem.typeOfCertificate === "Carer") {
            if (updatedItem.numberOfDaysChosen === "Single Day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice requires ${updatedItem.typeOfCertificate} leave on ${updatedItem.fromDate}`;
                nameofCaredPerson = `Caring for: ${updatedItem.nameofCaredPerson}`;
            } else if (updatedItem.numberOfDaysChosen === "Multi-day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice requires ${updatedItem.typeOfCertificate} leave from ${updatedItem.fromDate} to and including ${updatedItem.tillDate}.`;
                nameofCaredPerson = `Caring for: ${updatedItem.nameofCaredPerson}`;
            }

        } else if (updatedItem.typeOfCertificate === "Medical") { //basically Medical

            if (updatedItem.numberOfDaysChosen === "Single Day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice is suffering from a medical condition which renders them unfit for: ${updatedItem.medicalNeedFor} on ${updatedItem.fromDate}`;
            } else if (updatedItem.numberOfDaysChosen === "Multi-day") {
                differentCertificateReason = `In my opinion, the above named patient of this practice is suffering from a medical condition which renders them unfit for: ${updatedItem.medicalNeedFor} from ${updatedItem.fromDate} to and including ${updatedItem.tillDate}.`;
            }
        }
        console.log(differentCertificateReason + "is the reaason ");

        var pdfData = {
            "first_name": updatedItem.firstName,
            "last_name": updatedItem.lastName,
            "dateOfBirth": updatedItem.dob, //.toLocaleDateString('en-GB'),
            //"medicalReason": item.medicalNeedFor,
            "nameofCaredPerson": nameofCaredPerson,
            "medicalSymptom": updatedItem.medicalSymptom,
            "fromDate": updatedItem.fromDate,
            "tillDate": updatedItem.tillDate,
            "certificateID": updatedItem._id,
            "report_date": createdDateString,
            "certificateReason": differentCertificateReason,
            "address": updatedItem.address,
            "doctorName": doctorName,
            "doctorQualification": doctorQualification,
            "doctorProviderNumber": doctorProviderNumber,
            "doctorSign": finalDoctorSignature,
            "doctorAphraNumber": doctorAphraNumber

        }

        await generatePDFnewYourweb(template_id, pdfData, updatedItem)

    } else if (updatedItem.rejectedStatus === true) {

        console.log("patient was rejected. don't generate PDF");
        //var template_id = "f1777b2375d3ddfc"; //"f7c77b237b1e7fd2"; //"78c77b237bad3f5c"; //"ff177b2b2cd2e52c";

        // if (updatedItem.personID) {
        //     emailRejectionCertificate(updatedItem.personID, updatedItem.firstName)
        // } else if (!updatedItem.personID) {
        queryContactForID(updatedItem.email)
            .then((contactID) => {
                emailRejectionCertificate(contactID, updatedItem.firstName)

            })
        // }

    }

}

//sendCertificateToPatientForReferralCertificate

export async function sendCertificateToPatientForReferralCertificate(updatedItem, doctorsList) {

    let finalDBname = "finalDatabase-ReferralCertificate"

    const doctorContactID = doctorsList[0].doctorsId;
    const doctorName = doctorsList[0].doctorsName;
    const doctorProviderNumber = doctorsList[0].doctorProviderNumber;
    const doctorQualification = doctorsList[0].doctorQualification;
    const doctorSignature = doctorsList[0].doctorSignature;
    const doctorAphraNumber = doctorsList[0].doctorahpraNumber;

    const newDoctorSignature = doctorSignature.replace("wix:image://v1/", "https://static.wixstatic.com/media/");
    // Remove everything after '.png' (including '.png')
    const finalDoctorSignature = newDoctorSignature.split('.png')[0] + '.png';
    // Now finalDoctorSignature contains the modified URL
    console.log(`Final doctor url is ${finalDoctorSignature}`);

    let mainIssue, regularDoctorName, regularDoctorEmail, regularMedications, existingHealthConditions, medicineAllergies;

    let convDate = updatedItem._updatedDate.toDateString()
    //let createdDateString = await changeDateToString(convDate, -600)
    let createdDateString = await changeDateToString(updatedItem._updatedDate, -600)
    console.log(`Formatted CreatedDate String in backend is ${createdDateString}`); // Output: "10/08/2023"

    if (updatedItem.notifyRegularDoctor === "Yes") {
        regularDoctorName = `Regular Doctor: ${updatedItem.regularDoctorName}`;
        regularDoctorEmail = `Regular Doctor Address: ${updatedItem.regularDoctorsEmail}`;
    } else {
        regularDoctorName = `Regular Doctor: N/A`;
        regularDoctorEmail = `Regular Doctor Address: N/A`;
    }

    if (updatedItem.regularMedicationOption === "Yes") {
        regularMedications = `Current medications: ${updatedItem.regularMedicationTxt}`;
    } else {
        regularMedications = `Current medications: None`;
    }

    if (updatedItem.existingHealthCondn === "Yes") {
        existingHealthConditions = `Current medical history: ${updatedItem.existingHealthCondnTxt}`;
    } else {
        existingHealthConditions = `Current medical history: None`;
    }

    if (updatedItem.medcineAllergyOption === "Yes") {
        medicineAllergies = `Current Allergies:  ${updatedItem.medcineAllergyTxt}`;
    } else {
        medicineAllergies = `Current Allergies: None`;
    }

    if (updatedItem.approvedStatus === true) {
        console.log("patient was approved for referral certificate. generated PDF");

        var template_id = "ca477b238b8d67a0"; //"f7c77b237b1e7fd2"; //"78c77b237bad3f5c"; //"ff177b2b2cd2e52c";

        if (updatedItem.mainIssue === "Other") {
            mainIssue = `${updatedItem.otherMainDiagnosis}`
        } else if (updatedItem.mainIssue !== "Other") {
            mainIssue = `${updatedItem.mainIssue}`
        }

        var pdfData = {
            "certificateType": `Referral Certificate`,
            "report_date": createdDateString,
            "address": updatedItem.address,
            "dateOfBirth": updatedItem.dob, //.toLocaleDateString('en-GB'),
            "specialistDoctorName": updatedItem.specialistDoctorName,
            "specialistAddress": updatedItem.specialistDoctorAddress,
            "patientName": updatedItem.firstName + " " + updatedItem.lastName,
            "mainSymptom": mainIssue,
            "medicalHistory": existingHealthConditions,
            "medications": regularMedications,
            "allergies": medicineAllergies,
            "regularDoctor": regularDoctorName,
            "regularDoctorsEmail": regularDoctorEmail,
            "certificateID": updatedItem._id,
            "doctorName": doctorName,
            "doctorQualification": doctorQualification,
            "doctorProviderNumber": doctorProviderNumber,
            "doctorSign": finalDoctorSignature,
            "doctorAphraNumber": doctorAphraNumber
        }

        generatePDFnewForMultiCertificateGeneration(template_id, pdfData, updatedItem, finalDBname)

    } else if (updatedItem.rejectedStatus === true) {

        console.log("patient was rejected. don't generate PDF");
        //var template_id = "f1777b2375d3ddfc"; //"f7c77b237b1e7fd2"; //"78c77b237bad3f5c"; //"ff177b2b2cd2e52c";

        // if (updatedItem.personID) {
        //     emailRejectionCertificate(updatedItem.personID, updatedItem.firstName)
        // } else if (!updatedItem.personID) {
        queryContactForID(updatedItem.email)
            .then((contactID) => {
                emailRejectionCertificate(contactID, updatedItem.firstName)

            })
        // }

    }

}

export async function generatePDFnew(template_id, pdfData, updatedItem) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": pdfData,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, updatedItem.firstName)
                .then((fileDetails) => {
                    console.log(fileDetails.fileUrl)

                    let dataUpdateOptions = {
                        "suppressAuth": true

                    };

                    wixData.get("MainCertificateDatabase", updatedItem._id, dataUpdateOptions)
                        .then((item) => {
                            item.medicalCertificate = fileDetails.fileUrl; // updated last name
                            wixData.update("MainCertificateDatabase", item, dataUpdateOptions);
                            console.log(item); //see item below

                            let downloadLink = `https://f45dfa2f-60d1-4224-b07e-5cff48ca8f76.usrfiles.com/ugd/${fileDetails.fileName}`;

                            // if (item.personID) {
                            //     emailContactWithCertificate(item.personID, item.firstName, downloadLink)
                            // } else if (!item.personID) {
                            queryContactForID(item.email)
                                .then((contactID) => {
                                    emailContactWithCertificate(contactID, item.firstName, downloadLink)
                                })
                            // }

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
        });
}

export async function generatePDFnewYourweb(template_id, pdfData, updatedItem) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": pdfData,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(async json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            // Main flow: upload, save DB, wait for availability, get download link, send email
            uploadFile(fileRecieved, updatedItem.firstName).then(async (fileDetails) => {
                try {
                    console.log('upload result', fileDetails);
                    const fileUrl = fileDetails.fileUrl; // e.g. 'wix:.../filename.pdf' or the returned file path

                    // 1) Get item, update DB with fileUrl and wait for update to complete
                    const item = await wixData.get("MainCertificateDatabase", updatedItem._id, {
                        suppressAuth: true,
                        suppressHooks: true
                    });

                    item.medicalCertificate = fileUrl;
                    // Wait for the update to finish before attempting to generate download link
                    const updated = await wixData.update("MainCertificateDatabase", item, {
                        suppressAuth: true,
                        suppressHooks: true
                    });

                    console.log('DB updated with fileUrl:', updated.medicalCertificate);

                    // 2) Build the full redirect URL that will be used when creating the download link
                    const redirectUrl = `https://www.midoc.com.au/resend-medical-certification?medicalCertificationId=${updated._id}`;

                    console.log("Generate PDF attempt. fileUrl:", fileUrl, "expiryMinutes:", 1440, "redirectUrl:", redirectUrl);

                    // 3) Wait/retry until getDownloadUrl succeeds
                    const downloadLink = await waitForFileAvailability(fileUrl, 6, 2000, 1440, redirectUrl);
                    console.log('downloadLink', downloadLink);

                    // 4) Send email using contact lookup - ensure contactID exists before sending
                    // if (updated.personID) {
                    //     emailContactWithCertificate(updated.personID, updated.firstName, downloadLink);
                    // } else {
                    // queryContactForID returns a promise resolving to contactID
                    const contactID = await queryContactForID(updated.email);
                    if (contactID) {
                        emailContactWithCertificate(contactID, updated.firstName, downloadLink);
                    } else {
                        console.warn('No contact found for email', updated.email);
                    }
                    // }

                } catch (err) {
                    console.error('Error in upload -> DB -> getDownloadUrl flow:', err);
                }
            }).catch(err => {
                console.error('uploadFile failed:', err);
                const json = {
                    jsonEmail: {
                        'function': "emailContactWithCertificate",
                        template_id,
                        pdfData,
                        updatedItem
                    },
                    err
                }

                wixData.insert('CatchError', json, { suppressAuth: true, suppressHooks: true })
            });
        });
}

async function waitForFileAvailability(fileUrl, retries = 6, delayMs = 2000, expiryMinutes = 1440, redirectUrl) {
    // Attempt multiple times with delay. Use exponential backoff if desired.
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            // Attempt to generate download link. If Wix backend isn't ready it may throw.
            const downloadLink = await getDownloadUrl(fileUrl, expiryMinutes, redirectUrl);
            if (downloadLink) {
                console.log(`File available on attempt ${attempt}`);
                return downloadLink;
            }
        } catch (err) {
            console.log(`Attempt ${attempt} failed: file not ready or getDownloadUrl error ->`, err.message || err);
        }

        // If not last attempt, wait before retrying
        if (attempt < retries) {
            // simple wait; could implement exponential backoff: delayMs *= 2
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw new Error('File not available after several retries.');
}

export async function generatePDFnewForMultiCertificateGeneration(template_id, pdfData, updatedItem, dbName) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": pdfData,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, updatedItem.firstName)
                .then((fileDetails) => {
                    console.log(fileDetails.fileUrl)

                    let dataUpdateOptions = {
                        "suppressAuth": true
                    };

                    wixData.get(dbName, updatedItem._id, dataUpdateOptions)
                        .then((item) => {
                            item.medicalCertificate = fileDetails.fileUrl; // updated last name
                            wixData.update(dbName, item, dataUpdateOptions);
                            console.log(item); //see item below

                            let downloadLink = `https://f45dfa2f-60d1-4224-b07e-5cff48ca8f76.usrfiles.com/ugd/${fileDetails.fileName}`;

                            let emailType

                            if (dbName === "finalDatabase-ReferralCertificate") {
                                emailType = "Referral"
                            }

                            // if (item.personID) {
                            //     emailContactWithCertificateNew(item.personID, item.firstName, downloadLink, emailType)
                            // } else if (!item.personID) {
                            queryContactForID(item.email)
                                .then((contactID) => {
                                    emailContactWithCertificateNew(contactID, item.firstName, downloadLink, emailType)
                                })
                            // }

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
        });
}

/*
export async function generatePDFnew(template_id, data, insertedItem, toCreateMember, guestLogin, alreadyMember, toRegister) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": data,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, insertedItem.firstName)
                .then((fileDetails) => {
                    console.log(fileDetails.fileUrl)

                    let dataUpdateOptions = {
                        "suppressAuth": true
                    };

                    wixData.get("MedicalCertificateDataNew", insertedItem._id)
                        .then((item) => {
                            item.medicalCertificate = fileDetails.fileUrl; // updated last name
                            wixData.update("MedicalCertificateDataNew", item, dataUpdateOptions);
                            console.log(item); //see item below

                            let downloadLink = `https://f45dfa2f-60d1-4224-b07e-5cff48ca8f76.usrfiles.com/ugd/${fileDetails.fileName}`;

                            //GENERATE TRIGGERED EMAIL
                            if (toCreateMember) {
                                NewRegisterMemberFunction(toRegister)
                                    .then((registrationResult) => {
                                        console.log(registrationResult);
                                        memberID = registrationResult.member._id
                                        console.log("result successful in newregister-member-fuccntion");
                                        console.log("emailing new member");
                                        //emailContactWithCertificate(memberID, item.firstName, downloadLink)
                                        emailDoctor(item)
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            } else if (guestLogin) {
                                NewContactRegistration(toRegister)
                                    .then((registrationResult) => {
                                        console.log(registrationResult);
                                        memberID = registrationResult._id;
                                        console.log("emailing new contact");
                                        //emailContactWithCertificate(memberID, item.firstName, downloadLink)
                                        emailDoctor(item)
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                    });
                            } else if (alreadyMember) {
                                console.log("emailing member direclty");

                                //queryContactForID(item.email, item.firstName, downloadLink)
                                emailDoctor(item)

                            }

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
        });
}

export async function reGeneratePDF(template_id, data, item) {

    const api_key = await wixSecretsBackend.getSecret("api_key");

    var json_payload = JSON.stringify({
        "data": data,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, item.firstName)
                .then((fileDetails) => {
                    console.log(fileDetails.fileUrl)
                    let dataUpdateOptions = {
                        "suppressAuth": true
                    };

                    wixData.get("MedicalCertificateData", item._id)
                        .then((item) => {
                            item.medicalCertificate = fileDetails.fileUrl; // updated last name
                            wixData.update("MedicalCertificateData", item, dataUpdateOptions);
                            console.log(item); //see item below

                            let downloadLink = `https://f45dfa2f-60d1-4224-b07e-5cff48ca8f76.usrfiles.com/ugd/${fileDetails.fileName}`;
                            queryContactForID(item.email, item.firstName, downloadLink)

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
        });

}

export async function reGeneratePDFNew(template_id, data, item) {

    const api_key = await wixSecretsBackend.getSecret("api_key");

    var json_payload = JSON.stringify({
        "data": data,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
            "method": 'POST',
            "headers": {
                'Content-Type': 'application/json',
                "X-API-KEY": api_key
            },
            "body": json_payload
        })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, item.firstName)
                .then((fileDetails) => {
                    console.log(fileDetails.fileUrl)
                    let dataUpdateOptions = {
                        "suppressAuth": true
                    };

                    wixData.get("MedicalCertificateDataNew", item._id)
                        .then((item) => {
                            item.medicalCertificate = fileDetails.fileUrl; // updated last name
                            wixData.update("MedicalCertificateDataNew", item, dataUpdateOptions);
                            console.log(item); //see item below

                            let downloadLink = `https://f45dfa2f-60d1-4224-b07e-5cff48ca8f76.usrfiles.com/ugd/${fileDetails.fileName}`;
                            queryContactForID(item.email, item.firstName, downloadLink)

                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
        });

}
*/