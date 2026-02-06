// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixData from 'wix-data';
import { currentMember } from 'wix-members-frontend';
import wixUsers from 'wix-users';
import { getTemplates } from 'backend/clickSend.jsw'
import { sendChatMessage } from 'backend/sendChatMessage.jsw';
import { sendCertificateToPatientYourweb } from 'backend/generatePdf.jsw'
import { queryDoctorForContactID } from 'backend/emailContact.jsw'
import { generalQuery } from 'backend/collections.web.js';

let smallTimeoutValue = 2500;
let originalTillDate;

var doctorsID, memberID;

$w.onReady(async function () {
    // Original
    // currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
    //         console.log(member);
    //         memberID = member._id;
    //         const fullName = `${member.contactDetails.firstName} ${member.contactDetails.lastName}`;
    //         $w('#doctorMainTxt').text = `Dr. ${member.contactDetails.lastName}'s Dashboard`
    //         getMemberInfo();
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });

    // Only For Test
    memberID = $w('#memberId').value;
    $w('#btSearch').onClick(() => {
        memberID = $w('#memberId').value;
        getMemberInfo()
    });
    getMemberInfo();
});

function getMemberInfo() {
    queryDoctors().then((doctorList) => {
        console.log('doctorList', doctorList)
        console.log('memberID', memberID)
        console.log('memberID', $w('#memberId').value)
        const foundDoctor = doctorList.find(doctor => doctor.doctorsId === memberID);
        console.log('foundDoctor', foundDoctor)

        if (foundDoctor) {
            console.log(`The _id associated with memberID ${memberID} is ${foundDoctor._id}`);
            doctorsID = foundDoctor._id;
            console.log("doctorsID", doctorsID)
            loadDoctorsData(doctorsID);
        } else {
            console.log(`No matching record found for memberID ${memberID}`);
        }

    });

    // generalQuery("DoctorsHistoryPhoneNumber", "memberId", memberID).then((doctorInfoBack) => {
    //     if (doctorInfoBack.items.length > 0) {
    //         const doctorInfo = doctorInfoBack.items[0];
    //         // Query the database for SMS history
    //         wixData.query("ChatMessages").eq('contactId', memberID)
    //             //.hasSome('from', doctorInfo.phoneNumbers)
    //             .find().then((results) => {
    //                 let items = results.items;
    //                 $w('#patientDetailsRepeater').data = items;
    //                 $w("#patientDetailsRepeater").onItemReady(($item, itemData, index) => {
    //                     //$item("#timestamp").text = itemData.timestamp;
    //                     $item("#direction").text = itemData.direction;
    //                     $item("#from").text = itemData.from;
    //                     $item("#message").text = itemData.message;
    //                 });
    //                 $w("#patientDetailsRepeater").expand();
    //             }).catch((err) => { console.log(err); });
    //     }
    // })
}

export function queryDoctors() {
    let options = { suppressAuth: true }

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

export async function loadDoctorsData(doctorsID) {
    resultsLeft("Number of Approvals Left Loading...", smallTimeoutValue)

    let options = { suppressAuth: true }

    // let results = await wixData.query("MainCertificateDatabase")
    //     .include("tempDoctorId")
    //     .eq("tempDoctorId", doctorsID)
    //     // .ne("rejectedStatus", true)
    //     // .ne("approvedStatus", true)
    //     .limit(1000)
    //     .find(options)

    // let allItems = results.items;
    // while (results.hasNext()) {
    //     results = await results.next();
    //     allItems = allItems.concat(results.items);
    // }

    // if (allItems.length > 0) {
    //     let items = allItems;
    //     console.log(items);
    //     $w('#patientDetailsRepeater').data = items;
    //     $w('#patientDetailsRepeater').expand();
    //     setTimeout(() => {
    //         resultsLeft(`${items.length} number of approvals left`, smallTimeoutValue)
    //         $w('#patientDetailsRepeater').expand();
    //     }, 1500);
    // } else {
    //     console.log("nothing found");
    //     resultsLeft("No Approvals Left", smallTimeoutValue)
    //     $w('#patientDetailsRepeater').collapse();
    // }

    //return allItems;

    wixData.query("MainCertificateDatabase")
        .include("tempDoctorId")
        .eq("tempDoctorId", doctorsID)
        .ne("rejectedStatus", true)
        .ne("approvedStatus", true)
        .descending("_updatedDate")
        .find(options)
        .then((results) => {
            console.log("Items", results.items)
            if (results.items.length > 0) {
                let items = results.items;
                console.log(items);
                $w('#patientDetailsRepeater').data = items;
                $w('#patientDetailsRepeater').expand();
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
            $item('#group71').expand();
            $item('#boxChatHistory').expand();
            // $item('#group73').expand()
        })

        $item('#sendButton').onClick(async () => {
            const member = await wixUsers.currentUser;
            const memberId = member.id;
            try {
                const phoneNumber = $item('#phoneFinal').text;
                const message = $item("#textBox1").value;

                $item('#sendButton').label = "Loading..."
                const response = await sendChatMessage(memberId, `${itemData.phone}`, message || "")
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

    let isProcessing = false;

    $item('#approveBtn').onClick(async () => {
        if (isProcessing) return;
        isProcessing = true;

        $item('#approveBtn').disable();
        $item('#rejectBtn').disable();

        const doctorsComments = $item('#doctorComments').value;

        if (!doctorsComments) {
            loadMsgBoxTxt($item('#msgBoxTxt'), `No comments added`, smallTimeoutValue);
            isProcessing = false;
            $item('#approveBtn').enable();
            $item('#rejectBtn').enable();
            return;
        }

        loadMsgBoxTxt(
            $item('#msgBoxTxt'),
            `Comments being approved. Please wait.`,
            smallTimeoutValue
        );

        try {
            await updateDoctorComments(doctorsComments, "approved", itemData);
        } finally {
            isProcessing = false;
            $item('#approveBtn').enable();
            $item('#rejectBtn').enable();
        }
    });

    $item('#rejectBtn').onClick(async () => {
        if (isProcessing) return;
        isProcessing = true;

        $item('#approveBtn').disable();
        $item('#rejectBtn').disable();

        const doctorsComments = $item('#doctorComments').value;

        if (!doctorsComments) {
            loadMsgBoxTxt($item('#msgBoxTxt'), `No comments added`, smallTimeoutValue);
            isProcessing = false;
            $item('#approveBtn').enable();
            $item('#rejectBtn').enable();
            return;
        }

        loadMsgBoxTxt(
            $item('#msgBoxTxt'),
            `Comments being rejected. Please wait.`,
            smallTimeoutValue
        );

        try {
            await updateDoctorComments(doctorsComments, "rejected", itemData);
        } finally {
            isProcessing = false;
            $item('#approveBtn').enable();
            $item('#rejectBtn').enable();
        }
    });

    $item('#patientHistoryBtn').onClick(() => {

        $w('#previousHistorySection').expand();
        $w('#approvalSection').collapse();
        loadPreviousHistory(doctorsID, itemData.email);

    });

    generalQuery("PatientHistoryPhoneNumber", "patientId", itemData._id).then((patientInfoBack) => {
        if (patientInfoBack.items.length > 0) {
            const patientInfo = patientInfoBack.items[0];
            // Query the database for SMS history
            wixData.query("ChatMessages").hasSome('from', patientInfo.phoneNumbers).find().then((results) => {
                if (results.items.length > 0) {
                    let items = results.items;

                    const chatHtml = formatChatMessages(items);
                    $item('#chatHistory').html = chatHtml;
                    $item('#messageEmpty').collapse();
                    $item('#chatHistory').expand();
                }

            }).catch((err) => { console.log(err); });
        } else {
            $item('#messageEmpty').expand();
            $item('#chatHistory').collapse();
        }
    })

}

function formatChatMessages(messages) {
    return messages.map(({ timestamp, direction, message }) => {
        const formattedDate = new Date(timestamp).toLocaleString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });

        const color = direction === "sent" ? "#0D72C5" : "#F40A0A";

        return `
            <p class="wixui-rich-text__text" style="font-size:16px;">
                <span style="font-weight:bold;" class="wixui-rich-text__text">${formattedDate}&nbsp;</span>&nbsp;
                <span style="color:${color};" class="wixui-rich-text__text">
                    <span style="font-weight:bold;" class="wixui-rich-text__text">${direction}&nbsp;</span>
                </span>
                <span style="font-weight:normal;" class="wixui-rich-text__text">
                    <span style="color:#000000;" class="wixui-rich-text__text">${message}</span>
                </span>
            </p>
        `;
    }).join("\n");
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

export async function updateDoctorComments(doctorsComments, status, itemData) {
    try {
        const options = { suppressAuth: true };

        const item = await wixData.get(
            "MainCertificateDatabase",
            itemData._id,
            options
        );

        item.doctorsComments = doctorsComments;

        if (status === "approved") {
            item.approvedStatus = true;
        } else if (status === "rejected") {
            item.rejectedStatus = true;
        }

        const result = await wixData.update(
            "MainCertificateDatabase",
            item, { suppressAuth: true, suppressHooks: true }
        );

        $w('#patientDetailsRepeater').collapse();
        resultsLeft("Refreshing Database", smallTimeoutValue);
        loadDoctorsData(doctorsID);

        if (item.rejectedStatus === true) {
            await sendCertificateToPatientYourweb(item, [{
                _id: itemData.tempDoctorId._id,
                doctorsName: itemData.tempDoctorId.doctorsName,
                doctorSignature: itemData.tempDoctorId.doctorSignature,
                doctorsId: itemData.tempDoctorId.doctorsId,
                doctorProviderNumber: itemData.tempDoctorId.doctorProviderNumber,
                doctorQualification: itemData.tempDoctorId.doctorQualification,
                doctorahpraNumber: itemData.tempDoctorId.ahpraNumber
            }]);
        }

        return result;

    } catch (error) {
        console.error("Error updating doctor comments:", error);
        throw error;
    }
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