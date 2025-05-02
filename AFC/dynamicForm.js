import { insertCollection } from 'backend/collections.web.js';
import { currentMember } from "wix-members-frontend";
import wixData from 'wix-data';

import { emailForms } from 'backend/email.web.js';

let stateOrder = 1,
    state = [],
    item, memberId;

const validationPersonalDetails = ['#firstName', '#surname', '#nationality', '#dateOfBirth', '#passportNo', '#gender', '#image', '#emailAddress', '#mobileNumber', '#homeAddress'];
const validationRoles = ['#currentPositionTitle', '#department', '#divisionUnit', '#dateJoined', '#typeOfEmployment', '#ifContractValidityPeriod'];
let workExperienceData = [{ _id: '1', weOrganisation: '', wePositionTitle: '', weYearOfService: '', weResponsibilities: '' }];

$w.onReady(function () {
    getMember();
    init();
});

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        if (member._id) {
            memberId = member._id;
            let filter = wixData.filter().eq('memberId', member._id);
            $w('#dataset1').setFilter(filter);
            $w('#formStages').changeState('personalDetails');
        }

    }).catch((error) => { console.error(error); });
}

function init() {
    // Get Form Info
    $w('#dynamicDataset').onReady(() => {
        item = $w('#dynamicDataset').getCurrentItem();

        // personalDetails
        if (item.personalDetails) state.push({ order: item.personalDetailsOrder, state: "personalDetails", items: validationPersonalDetails });
        // rolesResponsibilities
        if (item.rolesResponsibilities) {
            const typeOfEmploymentOptions = item.typeOfEmployment.map(typeOfEmployment => ({ label: typeOfEmployment, value: typeOfEmployment }));
            $w('#typeOfEmployment').options = typeOfEmploymentOptions;
            state.push({ order: item.rolesResponsibilitiesOrder, state: "rolesResponsibilities", items: validationRoles });
        }
        // workExperience
        if (item.workExperience) state.push({ order: item.workExperienceOrder, state: "workExperience", items: { repeater: '#repWE', txtInfo: '', collectionField: 'workExperienceInfo', collectionFieldTxT: 'workExperienceTxT' } });
    })

    // ===================== Buttons functionality
    // Next
    $w('#pdNext').onClick(() => validationState(validationPersonalDetails));
    $w('#rrNext').onClick(() => validationState(validationRoles));
    $w('#weNext').onClick(async () => {
        try {
            const isValid = await validateRepeater('#repWE', ['#weOrganisation', '#wePositionTitle', '#weYearOfService', '#weResponsibilities']);
            // console.log(isValid)
            if (!isValid) { throw new Error("Validation failed"); }

            // If validation passes, proceed to next step
            changeState("Next");
        } catch (error) {
            console.log("Validation error:", error.message);
        }
    });
    // Previous
    $w('#rrPrevious').onClick(() => changeState("Previous"));
    $w('#wePrevious').onClick(() => changeState("Previous"));

    // ===================== Work Experience
    $w('#repWE').data = workExperienceData;
    $w('#repWE').onItemReady(($item, itemData, index) => {
        const weFieldsId = ['#weOrganisation', '#wePositionTitle', '#weYearOfService', '#weResponsibilities'];
        $item('#weOrganisation').onInput(() => {
            itemData.weOrganisation = $item('#weOrganisation').value;
            saveRepeaterInfo('#repWE', weFieldsId, 'workExperience');
        });
        $item('#wePositionTitle').onInput(() => {
            itemData.wePositionTitle = $item('#wePositionTitle').value;
            saveRepeaterInfo('#repWE', weFieldsId, 'workExperience');
        });
        $item('#weYearOfService').onInput(() => {
            itemData.weYearOfService = $item('#weYearOfService').value;
            saveRepeaterInfo('#repWE', weFieldsId, 'workExperience');
        });
        $item('#weResponsibilities').onInput(() => {
            itemData.weResponsibilities = $item('#weResponsibilities').value;
            saveRepeaterInfo('#repWE', weFieldsId, 'workExperience');
        });
        $item('#deleteItem').onClick(async () => {
            await deleteWorkExperience(itemData._id);
            saveRepeaterInfo('#repWE', weFieldsId, 'workExperience')
        })
    })
    $w('#adMoreWorkExperience').onClick(() => addMoreWorkExperience());

}

function addMoreWorkExperience() {
    workExperienceData.push({
        _id: (workExperienceData.length + 1).toString(),
        weOrganisation: '',
        wePositionTitle: '',
        weYearOfService: '',
        weResponsibilities: ''
    })
    $w('#repWE').data = workExperienceData;
}

function deleteWorkExperience(id) {
    if (workExperienceData.length !== 1) {
        workExperienceData = workExperienceData.filter(workExperienceItem => workExperienceItem._id !== id);
        $w('#repWE').data = workExperienceData;
    }
}

function changeState(stateFunction) {
    if (stateFunction == "Next") stateOrder++;
    else stateOrder--;

    const nextState = state.find(item => item.order == stateOrder);
    if (nextState !== undefined) $w('#formStages').changeState(nextState.state);
    else $w('#formStages').changeState('thankYou'), saveInfo();
}

function validationState(items) {
    try {
        const isValid = validation(items);
        if (!isValid) {
            if (validationPersonalDetails == validationPersonalDetails) {
                $w('#btCompleteProfile').expand();
            }
            throw new Error("Validation failed");
        }

        // If validation passes, proceed to next step
        changeState("Next");
    } catch (error) {
        console.log("Validation error:", error.message);
        // Optional: show a global error message if needed
    }
}

function validation(items) {
    let isValid = true;

    items.forEach((id) => {
        const input = $w(id);
        const errorTextId = `${id}Error`; // Error text field under each input

        // Clear previous error messages
        if ($w(errorTextId)) {
            $w(errorTextId).text = "";
            $w(errorTextId).hide();
        }

        let errorMessage = "";

        // Validate based on input type
        if (input.type === "$w.TextInput" || input.type === "$w.TextArea" || input.type === "$w.Dropdown" || input.type === "$w.RadioButtonGroup") {
            if (!input.value.trim()) {
                errorMessage = "This field is required";
            }
        } else if (input.type === "$w.DatePicker") {
            if (!input.value) {
                errorMessage = "Please select a date";
            }
        } else if (input.type === "$w.Image") {
            if (input.src == 'wix:image://v1/11062b_417c7d5563d54ee890ef140e133ace36~mv2.png/Textured%20Chocolate%20Squares.png#originWidth=1976&originHeight=2000' || input.src == undefined || input.src == '') {
                errorMessage = "Please upload a file";
            }
        } else if (input.type === "$w.AddressInput") {
            if (!input.value || !input.value.formatted || !input.value.city) {
                errorMessage = "Please enter a valid address";
            }
        }

        // Email-specific validation
        if (id === "#emailAddress" && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                errorMessage = "Enter a valid email address";
            }
        }

        // If there is an error, show it below the field
        if (errorMessage) {
            isValid = false;
            if ($w(errorTextId)) {
                $w(errorTextId).text = errorMessage;
                $w(errorTextId).show();
            }
        }
    });

    return isValid;
}

// Generic function to validate input fields inside a repeater
export async function validateRepeater(repeaterId, fieldIds) {
    let isValid = true;

    // Loop through each item in the repeater
    await $w(repeaterId).forEachItem(($item, itemData, index) => {
        fieldIds.forEach(fieldId => {
            const field = $item(fieldId);

            if (!field.value || field.value.trim() === "") {
                isValid = false;

                // Show Wix built-in invalid field UI
                field.updateValidityIndication();

                // Optional: show custom error text if you have a #fieldIdError element
                const errorTextId = `${fieldId}Error`;
                if ($item(errorTextId)) {
                    $item(errorTextId).text = "This field is required";
                    $item(errorTextId).show();
                }
            } else {
                // Hide error if field is valid
                const errorTextId = `${fieldId}Error`;
                if ($item(errorTextId)) {
                    $item(errorTextId).hide();
                }
            }
        });
    });

    return isValid;
}

async function saveRepeaterInfo(repeaterId, fields, nameState) {
    let summary = "";

    await $w(repeaterId).forEachItem(async ($item, itemData, index) => {
        summary += `Work ${index + 1}:\n`;

        for (const fieldId of fields) {
            const $input = $item(fieldId); // Get field in this repeater item
            const label = $input?.label || fieldId.replace('#', ''); // Use label or fallback to ID
            const value = $input?.value || ""; // Handle input or image field

            summary += `${label}: ${value}\n`;
        }

        summary += "\n";
    });

    state.forEach((stateItem) => {
        if (stateItem.state === nameState) {
            stateItem.items.txtInfo = summary.trim();
        }
    });
}

async function saveInfo() {
    let formData = {};
    let resultString = "";

    state.sort((a, b) => a.order - b.order);

    for (const stateItem of state) {
        // Add section title in uppercase
        resultString += `\n${stateItem.state.toUpperCase()}\n`;

        if (Array.isArray(stateItem.items)) {
            stateItem.items.forEach((fieldId) => {
                const key = fieldId.replace('#', '');
                const $field = $w(fieldId);
                formData[key] = $field.value || $field.src || "";

                if (fieldId !== '#image') {
                    let value = '';

                    if ($field.type == '$w.AddressInput') value = $field.value.formatted;
                    else if ($field.type == '$w.DatePicker') value = $field.value.toDateString();
                    else value = $field.value || "";

                    const label = $field.label || key;

                    resultString += `${label}: ${value}\n`;
                }

            });

        } else if (typeof stateItem.items === 'object') {
            const repeaterId = stateItem.items.repeater;
            const collectionField = stateItem.items.collectionField;
            const workExperienceTxT = stateItem.items.collectionFieldTxT;

            const repeaterData = $w(repeaterId).data || [];

            // Save JSON structure
            formData[collectionField] = repeaterData;

            // String summary from repeater
            let repeaterSummary = stateItem.items.txtInfo;

            formData[workExperienceTxT] = repeaterSummary.trim();
            resultString += repeaterSummary;
        }
    }

    // Add fixed fields
    formData.personalDetails = item.personalDetails;
    formData.rolesResponsibilities = item.rolesResponsibilities;
    formData.workExperience = item.workExperience;
    formData.title = item.title;
    formData.emailMessage = resultString;
    formData.memberId = memberId;
    formData.status = 'Sent';
    formData.additionalInformation = false;
    formData.sendEmailAdditionalInformation = false;

    // Insert data into collection
    insertCollection('Formssubmitted', formData).then((itemCollectionId) => {
        const json = {
            formName: item.title,
            name: $w('#firstName').value,
            data: resultString,
            urlWix: 'https://manage.wix.com/dashboard/181a573b-180a-484b-ad92-022b65cd0fb8/admin-pages/admin?referralInfo=viewerNavigation',
            // urlWix: `https://manage.wix.com/dashboard/181a573b-180a-484b-ad92-022b65cd0fb8/database/data/Formssubmitted/${itemCollectionId}`
        }
        emailForms(json);
    })

    // console.log("formData:", formData);
    // console.log("Final String:\n", resultString);
}