// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixData from 'wix-data';
import { currentMember } from 'wix-members-frontend';
import wixUsers from 'wix-users';
let doctorsID, memberID;
import { getTemplates } from 'backend/clickSend.jsw'
import { sendChatMessage } from 'backend/sendChatMessage.jsw';

import { sendCertificateToPatientYourweb } from 'backend/generatePdf.jsw'
import { queryDoctorForContactID } from 'backend/emailContact.jsw'

let smallTimeoutValue = 2500;
let originalTillDate;

$w.onReady(async function () {

    let options = {
        fieldsets: ['FULL']
    }

    currentMember.getMember(options)
        .then((member) => {
            console.log(member);
            memberID = member._id;
            const fullName = `${member.contactDetails.firstName} ${member.contactDetails.lastName}`;
            $w('#doctorMainTxt').text = `Dr. ${member.contactDetails.lastName}'s Dashboard`

            queryDoctors()
                .then((doctorList) => {
                    const foundDoctor = doctorList.find(doctor => doctor.doctorsId === memberID);

                    if (foundDoctor) {
                        console.log(`The _id associated with memberID ${memberID} is ${foundDoctor._id}`);
                        doctorsID = foundDoctor._id;
                        loadDoctorsData(doctorsID);
                    } else {
                        console.log(`No matching record found for memberID ${memberID}`);
                    }

                });

            // Query the database for SMS history
            wixData.query("ChatMessages")
                .eq('contactId', memberID)
                .find()
                .then((results) => {
                    let items = results.items;
                    $w("#patientDetailsRepeater").data = items;
                    $w("#patientDetailsRepeater").onItemReady(($item, itemData, index) => {
                        console.log(itemData.direction);
                        //$item("#timestamp").text = itemData.timestamp;
                        $item("#direction").text = itemData.direction;
                        $item("#from").text = itemData.from;
                        $item("#message").text = itemData.message;
                    });
                })
                .catch((err) => {
                    console.log(err);
                });

            //loadDoctorsData(doctorsID)

        })
        .catch((error) => {
            console.error(error);
        });

});

export function queryDoctors() {
    let options = {
        suppressAuth: true
    }

    return wixData.query("DoctorsDatabase")
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

export function loadDoctorsData(doctorsID) {
    resultsLeft("Number of Approvals Left Loading...", smallTimeoutValue)

    let options = {
        suppressAuth: true
    }

    wixData.query("MainCertificateDatabase")
        .include("tempDoctorId")
        .eq("tempDoctorId", doctorsID)
        .ne("rejectedStatus", true)
        .ne("approvedStatus", true)
        .find(options)
        .then((results) => {
            if (results.items.length > 0) {
                let items = results.items;
                console.log(items);
                $w('#patientDetailsRepeater').data = items;
                setTimeout(() => {
                    resultsLeft(`${items.length} number of approvals left`, smallTimeoutValue)
                    $w('#patientDetailsRepeater').expand();
                }, 1500);
            } else {
                console.log("nothing found");
                resultsLeft("No Approvals Left", smallTimeoutValue)
                $w('#patientDetailsRepeater').collapse();
            }
        })
        .catch((err) => {
            console.log(err);
        });

}

export function patientDetailsRepeater_itemReady($item, itemData, index) {

    if (itemData.typeOfCertificate === "Carer") {
        $item('#firstNameFinal').text = `First Name: ${itemData.firstName}`;
        $item('#lastNameFinal').text = `Last Name: ${itemData.lastName}`;
        $item('#emailFinal').text = `Email: ${itemData.email}`;
        $item('#phoneFinal').text = `Phone: ${itemData.phone}`;
        $item('#dobFinal').text = `Date of Birth: ${itemData.dob}`;
        $item('#addressFinal').text = `Address: ${itemData.address}`;

        $item('#needCertificateForFinal').text = `Need Certificate For: ${itemData.medicalNeedFor}`;
        $item('#symptomFinal').text = `Symptom: ${itemData.medicalSymptom}`
        $item('#fromDateFinal').text = `From Date: ${itemData.fromDate}`;
        $item('#tillDateFinal').text = `Till Date: ${itemData.tillDate}`;

        /*
        if (itemData.numberOfDaysChosen === "Single Day") {
            $item('#tillDateFinal').collapse();
        } else if (itemData.numberOfDaysChosen === "Multi-day") {
            $item('#tillDateFinal').text = `Till Date: ${itemData.tillDate}`;
        }
        */

        if (itemData.under18Flag) {
            $item('#guardianFirstNameFinalTxt').text = `Guardian First Name: ${itemData.guardianFirstName}`;
            $item('#guardianLastNameFinalTxt').text = `Guardian Last Name: ${itemData.guardianLastName}`;

        } else {
            $item('#guardianFirstNameFinalTxt').collapse();
            $item('#guardianLastNameFinalTxt').collapse();
        }

        $item('#uniqueFinalTxt4').collapse();
        $item('#uniqueFinalTxt1').text = `Name of Person Cared For: ${itemData.nameofCaredPerson}`;
        $item('#uniqueFinalTxt2').text = `Symptom Start Date: ${itemData.symptomStartDate}`;
        $item('#uniqueFinalTxt3').text = `Symptom Advise: ${itemData.symptomAdvise}`;

    } else if (itemData.typeOfCertificate === "Medical") {
        $item('#firstNameFinal').text = `First Name: ${itemData.firstName}`;
        $item('#lastNameFinal').text = `Last Name: ${itemData.lastName}`;
        $item('#emailFinal').text = `Email: ${itemData.email}`;
        $item('#phoneFinal').text = `Phone: ${itemData.phone}`;
        $item('#dobFinal').text = `Date of Birth: ${itemData.dob}`;
        $item('#addressFinal').text = `Address: ${itemData.address}`;

        $item('#needCertificateForFinal').text = `Need Certificate For: ${itemData.medicalNeedFor}`;
        $item('#symptomFinal').text = `Symptom: ${itemData.medicalSymptom}`
        $item('#fromDateFinal').text = `From Date: ${itemData.fromDate}`;
        $item('#tillDateFinal').text = `Till Date: ${itemData.tillDate}`;

        $item('#messageToPatient').onClick(() => {
            $item('#group71').expand()
            $item('#group73').expand()
        })

        $item('#sendButton').onClick(async () => {
            const member = await wixUsers.currentUser;
            const memberId = member.id;
            try {
                const phoneNumber = $item('#phoneFinal').text;
                const message = $item("#textBox1").value;

                $item('#sendButton').label = "Loading..."
                const response = await sendChatMessage(memberId, `${itemData.phone}`, message || "", itemData._id)
                console.log("response", response);
                $item("#sendButton").label = "Send"
            } catch (error) {
                $item("#sendButton").label = "Send"
            }
        })

        /*
        if (itemData.numberOfDaysChosen === "Single Day") {
            $item('#previousTillDateFinal').collapse();
        } else if (itemData.numberOfDaysChosen === "Multi-day") {
            $item('#previousTillDateFinal').text = `Till Date: ${itemData.tillDate}`;
        }
        */

        if (itemData.numberOfDaysChosen === "Single Day") {
            $item('#tillDateFinal').collapse();
        } else if (itemData.numberOfDaysChosen === "Multi-day") {
            $item('#tillDateFinal').text = `Till Date: ${itemData.tillDate}`;

            $item("#tillDateFinal").onClick(() => { selectItemForUpdate(itemData) });
        }

        if (itemData.under18Flag) {
            $item('#guardianFirstNameFinalTxt').text = `Guardian First Name: ${itemData.guardianFirstName}`;
            $item('#guardianLastNameFinalTxt').text = `Guardian Last Name: ${itemData.guardianLastName}`;

        } else {
            $item('#guardianFirstNameFinalTxt').collapse();
            $item('#guardianLastNameFinalTxt').collapse();
        }

        $item('#uniqueFinalTxt4').text = `Symptom Start Date: ${itemData.symptomStartDate}`;

        if (itemData.regularMedicationOption === "Yes") {
            $item('#uniqueFinalTxt1').text = `Health History: ${itemData.regularMedicationOption} --  ${itemData.regularMedicationTxt}`;
        } else if (itemData.regularMedicationOption === "No") {
            $item('#uniqueFinalTxt1').text = `Health History: ${itemData.regularMedicationOption}`;
        }

        // if (itemData.existingHealthCondn === "Yes") {
        //     $item('#uniqueFinalTxt2').text = `Existing Health Condition: ${itemData.existingHealthCondn} --  ${itemData.existingHealthCondnTxt}`;
        // } else if (itemData.existingHealthCondn === "No") {
        //     $item('#uniqueFinalTxt2').text = `Existing Health Condition: ${itemData.existingHealthCondn}`;
        // }

        $item('#uniqueFinalTxt2').text = `My Symptoms: ${itemData.existingHealthCondnTxt}`;

        $item('#uniqueFinalTxt3').text = `Gender: ${itemData.aboriginalStatus}`;
    }

    $item('#certificateTypeFinalTxt').text = `Certificate Type: ${itemData.typeOfCertificate}`;

    $item('#callPatientBtn').link = `tel:+61${itemData.phone}`;

    $item('#certificateTypeFinalTxtcallPatientBtn').text = `Certificate Type: ${itemData.typeOfCertificate}`;

    if (itemData.priorityStatus === true) {
        $item('#priorityImage').expand();
    } else if (itemData.priorityStatus !== true) {
        $item('#priorityImage').collapse();
    }

    $item("#updatedate").onClick(() => {
        console.log("updatedate btn clicked");
        let tillDate = $item('#dateselection').value;
        updateTillDate(tillDate, itemData);
    });

    $item('#approveBtn').onClick(() => {

        console.log("approval btn clicked");
        let doctorsComments = $item('#doctorComments').value;

        if (!doctorsComments) {
            loadMsgBoxTxt($item('#msgBoxTxt'), `No comments Added`, smallTimeoutValue);
        } else {
            loadMsgBoxTxt($item('#msgBoxTxt'), `Comments Being Approved. Please wait.`, smallTimeoutValue);
            updateDoctorComments(doctorsComments, "approved", itemData);
        }

    });

    $item('#rejectBtn').onClick(() => {

        let doctorsComments = $item('#doctorComments').value;

        if (!doctorsComments) {
            loadMsgBoxTxt($item('#msgBoxTxt'), `No comments Added`, smallTimeoutValue);
        } else {
            loadMsgBoxTxt($item('#msgBoxTxt'), `Comments Being Approved. Please wait.`, smallTimeoutValue);
            updateDoctorComments(doctorsComments, "rejected", itemData);
        }

    });

    $item('#patientHistoryBtn').onClick(() => {

        $w('#previousHistorySection').expand();
        $w('#approvalSection').collapse();
        loadPreviousHistory(doctorsID, itemData.email);

    });

}

let idToUpdateForTillDate = "";

const selectItemForUpdate = (itemData) => {
    $w("#dateselection").value = itemData.tillDate;
    idToUpdateForTillDate = itemData._id;
}

export function updateTillDate(tillDate, itemData) {

    let tilldateoptions = {
        suppressAuth: true
    }

    wixData.get("MainCertificateDatabase", itemData._id, tilldateoptions)

        .then((item) => {
            item.tillDate = tillDate;
            wixData.update("MainCertificateDatabase", item, tilldateoptions)
                .then((results) => {
                    console.log(results);
                })
                .catch((err) => {
                    console.log(err);
                })
        })
}

export function loadMsgBoxTxt($msgBoxTxt, msgValue, smallTimeoutValue) {
    $msgBoxTxt.expand();
    $msgBoxTxt.text = msgValue;

    setTimeout(() => {
        $msgBoxTxt.collapse();
    }, smallTimeoutValue);
}

export function updateDoctorComments(doctorsComments, status, itemData) {

    let doctorDBID = itemData.tempDoctorId._id;
    console.log(itemData);
    console.log(`Doctors ID in main database is ${doctorDBID}`);
    let doctorsList = [{
        "_id": itemData.tempDoctorId._id, // "0083821b-8e78-400a-bfb7-90d279bc6dbe",
        "doctorsName": itemData.tempDoctorId.doctorsName, // "Dr. Jaosh Sethna",
        "doctorSignature": itemData.tempDoctorId.doctorSignature, // "wix:image://v1/f45dfa_9b0cb65127c947218d96052326c39a25~mv2.png/phone%20icon.png#originWidth=155&originHeight=155",
        "doctorsId": itemData.tempDoctorId.doctorsId, //"56df28b0-9be9-40c9-88a7-8069132ccd3b",
        "doctorProviderNumber": itemData.tempDoctorId.doctorProviderNumber, //" MBA Provider Number 666666",
        "doctorQualification": itemData.tempDoctorId.doctorQualification, // "BBA Dr"
        "doctorahpraNumber": itemData.tempDoctorId.ahpraNumber
    }]
    console.log(doctorsList)

    let options = {
        suppressAuth: true
    }

    wixData.get("MainCertificateDatabase", itemData._id, options)
        .then((item) => {

            item.doctorsComments = doctorsComments;
            if (status === "approved") {
                item.approvedStatus = true
            } else if (status === "rejected") {
                item.rejectedStatus = true
            }
            wixData.update("MainCertificateDatabase", item, options)
                .then((results) => {
                    console.log(results); //see item below
                    $w('#patientDetailsRepeater').collapse();
                    resultsLeft("Refreshing Database", smallTimeoutValue)
                    sendCertificateToPatientYourweb(item, doctorsList);
                    loadDoctorsData(doctorsID);
                })
                .catch((err) => {
                    console.log(err);
                });

        })
        .catch((err) => {
            console.log(err);
        });

    /*
    queryDoctorForContactID(doctorDBID)
        .then((doctorsList) => {

            
            

        })
        .catch((err) => {
            console.log(err);
        });
        */

}

export function resultsLeft(msgValue, timeout) {

    $w('#resultsLeftTxt').text = msgValue;
    $w('#resultsLeftTxt').expand();

    setTimeout(() => {
        $w('#resultsLeftTxt').collapse();
    }, timeout);

}

/* ----- PATIENTS PREVIOUS HISTORY SECTION*/

export function loadPreviousHistory(doctorsID, patientsEmail) {
    previousTxtBox("Patient History Loading...", smallTimeoutValue)

    let options = {
        suppressAuth: true
    }

    wixData.query("MainCertificateDatabase")
        .include("tempDoctorId")
        .eq("email", patientsEmail)
        .eq("tempDoctorId", doctorsID)
        .isNotEmpty("doctorsComments")
        .find(options)
        .then((results) => {
            if (results.items.length > 0) {
                let items = results.items;
                console.log(items);
                $w('#previousHistoryRepeater').data = items;
                previousTxtBox(`${items.length} records found`, smallTimeoutValue)
                $w('#previousHistoryRepeater').expand();
            } else {
                console.log("nothing found");
                previousTxtBox("No Records Found", smallTimeoutValue)
                $w('#backToApprBtn').expand();
                $w('#previousHistoryRepeater').collapse();
            }
        })
        .catch((err) => {
            console.log(err);
        });

}

export function previousTxtBox(msgValue, timeout) {

    $w('#previousHistoryTxt').text = msgValue;
    $w('#previousHistoryTxt').expand();

    setTimeout(() => {
        $w('#previousHistoryTxt').collapse();
    }, timeout);

}

export function previousHistoryRepeater_itemReady($item, itemData, index) {
    console.log("previous histroy reptr ready");
    $w('#previousHistoryRepeater').expand();

    if (itemData.typeOfCertificate === "Carer") {
        $item('#previousFirstNameFinal').text = `First Name: ${itemData.firstName}`;
        $item('#previousLastNameFinal').text = `Last Name: ${itemData.lastName}`;
        $item('#previousEmailFinal').text = `Email: ${itemData.email}`;
        $item('#previousPhone').text = `Phone: ${itemData.phone}`;
        $item('#previousdobFinal').text = `Date of Birth: ${itemData.dob}`;
        $item('#previousAddressFinal').text = `Address: ${itemData.address}`;

        $item('#previousNeedCertificateForFinal').text = `Need Certificate For: ${itemData.medicalNeedFor}`;
        $item('#previousSymptomFinal').text = `Symptom: ${itemData.medicalSymptom}`
        $item('#previousFromDateFinal').text = `From Date: ${itemData.fromDate}`;
        $item('#previousTillDateFinal').text = `Till Date: ${itemData.tillDate}`;

        /*
        if (itemData.numberOfDaysChosen === "Single Day") {
            $item('#previousTillDateFinal').collapse();
        } else if (itemData.numberOfDaysChosen === "Multi-day") {
            $item('#previousTillDateFinal').text = `Till Date: ${itemData.tillDate}`;
        }
        */

        if (itemData.under18Flag) {
            $item('#previousGuardianFirstNameFinalTxt').text = `Guardian First Name: ${itemData.guardianFirstName}`;
            $item('#previousGuardianLastNameFinalTxt').text = `Guardian Last Name: ${itemData.guardianLastName}`;

        } else {
            $item('#previousGuardianFirstNameFinalTxt').collapse();
            $item('#previousGuardianLastNameFinalTxt').collapse();
        }

        $item('#previousUniqueFinalTxt4').collapse();
        $item('#previousUniqueFinalTxt1').text = `Name of Person Cared For: ${itemData.nameofCaredPerson}`;
        $item('#previousUniqueFinalTxt2').text = `Symptom Start Date: ${itemData.symptomStartDate}`;
        $item('#previousUniqueFinalTxt3').text = `Symptom Advise: ${itemData.symptomAdvise}`;

    } else if (itemData.typeOfCertificate === "Medical") {
        $item('#previousFirstNameFinal').text = `First Name: ${itemData.firstName}`;
        $item('#previousLastNameFinal').text = `Last Name: ${itemData.lastName}`;
        $item('#previousEmailFinal').text = `Email: ${itemData.email}`;
        $item('#previousPhone').text = `Phone: ${itemData.phone}`;
        $item('#previousdobFinal').text = `Date of Birth: ${itemData.dob}`;
        $item('#previousAddressFinal').text = `Address: ${itemData.address}`;

        $item('#previousNeedCertificateForFinal').text = `Need Certificate For: ${itemData.medicalNeedFor}`;
        $item('#previousSymptomFinal').text = `Symptom: ${itemData.medicalSymptom}`
        $item('#previousFromDateFinal').text = `From Date: ${itemData.fromDate}`;
        $item('#previousTillDateFinal').text = `Till Date: ${itemData.tillDate}`;

        if (itemData.numberOfDaysChosen === "Single Day") {
            //$item('#previousTillDateFinal').collapse();
        } else if (itemData.numberOfDaysChosen === "Multi-day") {
            //$item('#previousTillDateFinal').text = `Till Date: ${itemData.tillDate}`;
        }

        if (itemData.under18Flag) {
            $item('#previousGuardianFirstNameFinalTxt').text = `Guardian First Name: ${itemData.guardianFirstName}`;
            $item('#previousGuardianLastNameFinalTxt').text = `Guardian Last Name: ${itemData.guardianLastName}`;

        } else {
            $item('#previousGuardianFirstNameFinalTxt').collapse();
            $item('#previousGuardianLastNameFinalTxt').collapse();
        }

        $item('#previousUniqueFinalTxt4').text = `Symptom Start Date: ${itemData.symptomStartDate}`;

        if (itemData.regularMedicationOption === "Yes") {
            $item('#previousUniqueFinalTxt1').text = `Regular Medication: ${itemData.regularMedicationOption} - ${itemData.regularMedicationTxt}`;
        } else if (itemData.regularMedicationOption === "No") {
            $item('#previousUniqueFinalTxt1').text = `Regular Medication: ${itemData.regularMedicationOption}`;
        }

        if (itemData.existingHealthCondn === "Yes") {
            $item('#previousUniqueFinalTxt2').text = `Existing Health Condition: ${itemData.existingHealthCondn}  ${itemData.existingHealthCondnTxt}`;
        } else if (itemData.existingHealthCondn === "No") {
            $item('#previousUniqueFinalTxt2').text = `Existing Health Condition: ${itemData.existingHealthCondn}`;
        }

        $item('#previousUniqueFinalTxt3').text = `Aborignal Status: ${itemData.aboriginalStatus}`;
    }

    $item('#previousCertificateTypeFinalTxt').text = `Certificate Type: ${itemData.typeOfCertificate}`;

    if (itemData.approvedStatus) {
        $item('#previousHistryApprovedBtn').expand()
    }

    if (itemData.rejectedStatus) {
        $item('#previousHistryRejectedBtn').expand()
    }

    if (itemData.priorityStatus === true) {
        $w('#priorityImage').expand();
    } else if (itemData.priorityStatus !== true) {
        $w('#priorityImage').collapse();
    }

    $item('#previousCallPatientBtn').link = `tel:+61${itemData.phone}`;

    $item('#previousComments').value = `${itemData.doctorsComments}`;

    $item('#backToApprovalBtn').onClick(() => {

        $w('#previousHistorySection').collapse();
        $w('#approvalSection').expand();
        //    loadDoctorsData(doctorsID);

    });

}

export function backToApprBtn_click(event) {
    $w('#previousHistorySection').collapse();
    $w('#approvalSection').expand();
    //loadDoctorsData(doctorsID);
}

// import { getInboundSMS } from 'backend/clicksend';

// // Function to load and display the inbound SMS
// $w.onReady(function () {
//     getInboundSMS()
//         .then(messages => {
//             if (messages.error) {
//                 $w("#errorMessage").text = "Error fetching messages: " + messages.error;
//             } else {
//                 let messageDisplay = messages.map(msg => `From: ${msg.from}, Message: ${msg.body}`).join("\n");
//                 $w("#inboundMessages").text = messageDisplay;
//             }
//         })
//         .catch(err => {
//             console.error("Error retrieving SMS:", err);
//             $w("#errorMessage").text = "Failed to retrieve SMS.";
//         });
// });