let stateOrder = 1,
    state = [],
    item;

const validationPersonalDetails = ['#firstName', '#surname', '#nationality', '#dateOfBirth', '#passportNo', '#gender', '#image', '#emailAddress', '#mobileNumber', '#homeAddress'];
const validationRoles = ['#currentPositionTitle', '#department', '#divisionUnit', '#dateJoined', '#typeOfEmployment', '#ifContractValidityPeriod'];
let workExperienceData = [{ _id: '1', weOrganisation: '', wePositionTitle: '', weYearOfService: '', weResponsibilities: '' }];

$w.onReady(function () {
    init();
});

function init() {
    // Get Form Info
    $w('#dynamicDataset').onReady(() => {
        item = $w('#dynamicDataset').getCurrentItem();

        if (item.personalDetails) {
            const genderOptions = item.gender.map(gender => ({ label: gender, value: gender }));
            $w('#gender').options = genderOptions;
            state.push({ order: item.personalDetailsOrder, state: "personalDetails", items: validationPersonalDetails });
        }
        if (item.rolesResponsibilities) {
            const typeOfEmploymentOptions = item.typeOfEmployment.map(typeOfEmployment => ({ label: typeOfEmployment, value: typeOfEmployment }));
            $w('#typeOfEmployment').options = typeOfEmploymentOptions;
            state.push({ order: item.rolesResponsibilitiesOrder, state: "rolesResponsibilities", items: validationRoles });
        }
        if (item.workExperience) state.push({ order: item.workExperienceOrder, state: "workExperience", items: { repeater: '#repWE', fields: ['#weOrganisation', '#wePositionTitle', '#weYearOfService', '#weResponsibilities'], collectionField: 'workExperienceInfo', collectionFieldTxT: 'workExperienceInfoTxT' } });
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
        $item('#weOrganisation').onInput(() => itemData.weOrganisation = $item('#weOrganisation').value);
        $item('#wePositionTitle').onInput(() => itemData.wePositionTitle = $item('#wePositionTitle').value);
        $item('#weYearOfService').onInput(() => itemData.weYearOfService = $item('#weYearOfService').value);
        $item('#weResponsibilities').onInput(() => itemData.weResponsibilities = $item('#weResponsibilities').value);
        $item('#deleteItem').onClick(() => deleteWorkExperience(itemData._id))
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
        workExperienceData = workExperienceData.filter(item => item._id !== id);
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
        } else if (input.type === "$w.UploadButton") {
            if (!input.value || input.value.length === 0) {
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

function saveInfo() {
    let formData = {};
    let resultString = ""; // String summary of all values

    state.sort((a, b) => a.order - b.order);

    state.forEach((stateItem) => {
        // Add section title in uppercase
        resultString += `\n\n${stateItem.state.toUpperCase()}\n`;

        // CASE 1: When items is an array of input field IDs
        if (Array.isArray(stateItem.items)) {
            stateItem.items.forEach((fieldId) => {
                const key = fieldId.replace('#', '');
                const $field = $w(fieldId);
                const value = $field.value || "";
                const label = $field.label || key;

                formData[key] = value;
                resultString += `${label}: ${value}\n`;
            });

            // CASE 2: When items is an object (repeater)
        } else if (typeof stateItem.items === 'object') {
            const repeaterId = stateItem.items.repeater;
            const fields = stateItem.items.fields;
            const collectionField = stateItem.items.collectionField;
            const collectionFieldTxT = collectionField + "TxT";

            const repeaterData = $w(repeaterId).data || [];

            // Store full JSON array
            formData[collectionField] = repeaterData;

            // Generate a string for each item in the repeater
            let repeaterSummary = "";

            repeaterData.forEach((item, index) => {
                repeaterSummary += `Item ${index + 1}:\n`;
                fields.forEach((fieldId) => {
                    const key = fieldId.replace('#', '');
                    const $input = $w(repeaterId).forItems(($item) => $item(fieldId));
                    const label = $input?.label || key;
                    const value = item[key] || "";

                    repeaterSummary += `${label}: ${value}\n`;
                });
                repeaterSummary += "\n";
            });

            // Store string summary in formData
            formData[collectionFieldTxT] = repeaterSummary.trim();
            resultString += repeaterSummary;
        }
    });

    console.log("formData:", formData);
    console.log("Final String:\n", resultString);

}