import { insertCollection } from 'backend/collections.web.js';
import { currentMember } from "wix-members-frontend";
import wixData from 'wix-data';

import { emailForms } from 'backend/email.web.js';

let stateOrder = 1,
    state = [],
    item, memberId;

const validationPersonalDetails = [
    '#firstName',
    '#surname',
    '#nationality',
    '#dateOfBirth',
    '#passportNo',
    '#gender',
    '#image',
    '#emailAddress',
    '#mobileNumber',
    '#homeAddress'
];

const validationRoles = [
    '#currentPositionTitle',
    '#department',
    '#divisionUnit',
    '#dateJoined',
    '#typeOfEmployment',
    '#ifContractValidityPeriod',
    { repId: '#rrRepRoleResponsabilities', fieldsId: ['#rrRole', '#rrResponsabilities', '#rrDeliverables'], validation: '' },
    '#rrProfessionalAchievementValidation',
    { repId: '#rrProfessionalAchievementsRep', fieldsId: ['#rrProfessionalAchievement'], validation: '#rrProfessionalAchievementValidation' },
    '#rrPreviousPosition',
    '#rrPositionTitle',
    '#rrDateJoinend',
    '#rrRolesResponsabilities',
];

const validationWE = [
    { repId: '#repWE', fieldsId: ['#weOrganisation', '#wePositionTitle', '#weYearOfService', '#weResponsibilities'], validation: '' }
]

const validationAcademicProfessionalQualifications = [
    { repId: '#apqRepAcademicProfessional', fieldsId: ['#apqAcademyInstitution', '#apqCityCountry', '#apqDatesattended', '#apqQualification'], validation: '' },
    '#apqEnrolled',
    '#apqeAcademyInstitution',
    '#apqeCityCountry',
    '#apqeDatesAttended',
    '#apqeQualification'
]

const validationEnglishLanguageProficiency = [
    '#elpWrittenEnglish',
    '#elpSpokenEnglish',
    '#elpPracticeOfEnglish',
    '#elpInternationallyRecognised',
    '#elpNameOfEnglishQualification',
    '#elpAccreditedEndorsedBy',
    '#elpCommencementCompletionDate',
    '#elpCertificateOfCompletion'
]

const validationItProficiency = [
    '#itpUsageOfOnlinePlatformsPreviously',
    '#itpUnderstandingAndUsageOfIt'
]

const validactionDeclarations = [
    '#dName',
    '#dDesignation',
    '#dDate',
    '#dSignatureFile',
]

let workExperienceData = [{ _id: '1', weOrganisation: '', wePositionTitle: '', weYearOfService: '', weResponsibilities: '' }];
let workExperienceItems = { weOrganisation: '', wePositionTitle: '', weYearOfService: '', weResponsibilities: '' };

let currentRoleResponsabilitiesData = [{ _id: '1', rrRole: '', rrResponsabilities: '', rrDeliverables: '' }];
let currentRoleResponsabilitiesItems = { rrRole: '', rrResponsabilities: '', rrDeliverables: '' };

let professionalAchievementsData = [{ _id: '1', rrProfessionalAchievement: '' }];
let professionalAchievementsItems = { rrProfessionalAchievement: '' };

let academicProfessionalData = [{ _id: '1', apqAcademyInstitution: '', apqCityCountry: '', apqDatesattended: '', apqQualification: '' }];
let academicProfessionalItems = { apqAcademyInstitution: '', apqCityCountry: '', apqDatesattended: '', apqQualification: '' };

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
            $w('#dataset1').onReady(() => {
                const currentMember = $w('#dataset1').getCurrentItem();
            })
        }

    }).catch((error) => { console.error(error); });
}

function init() {
    // Get Form Info
    $w('#dynamicDataset').onReady(() => {
        item = $w('#dynamicDataset').getCurrentItem();

        // personalDetails
        if (item.personalDetails) state.push({ order: item.personalDetailsOrder, state: "personalDetails", itemsArrayCheck: true, itemsArray: validationPersonalDetails, itemsObjectCheck: false, itemObject: null });
        // rolesResponsibilities
        if (item.rolesResponsibilities) {
            const typeOfEmploymentOptions = item.typeOfEmployment.map(typeOfEmployment => ({ label: typeOfEmployment, value: typeOfEmployment }));
            $w('#typeOfEmployment').options = typeOfEmploymentOptions;
            let jsonObject = {
                'currentRoleAndResponsabilities': {
                    repeater: '#rrRepRoleResponsabilities',
                    txtInfo: '',
                    collectionField: 'currentRolesAndResponsabilitiesInfo',
                    collectionFieldTxT: 'currentRolesAndResponsabilitiesInfoTxT'
                },
                'professionalAchievements': {
                    repeater: '#rrProfessionalAchievementsRep',
                    txtInfo: '',
                    collectionField: 'professionalAchievementsInfo',
                    collectionFieldTxT: 'professionalAchievementsTxT'
                }
            }
            state.push({
                order: item.rolesResponsibilitiesOrder,
                state: "rolesResponsibilities",
                itemsArrayCheck: true,
                itemsArray: validationRoles,
                itemsObjectCheck: true,
                itemObject: jsonObject
            });
        }

        // workExperience
        if (item.workExperience) {
            let jsonObject = {
                'workExperience': {
                    repeater: '#repWE',
                    txtInfo: '',
                    collectionField: 'workExperienceInfo',
                    collectionFieldTxT: 'workExperienceTxT'
                }
            }

            state.push({
                order: item.workExperienceOrder,
                state: "workExperience",
                itemsArrayCheck: true,
                itemsArray: validationWE,
                itemsObjectCheck: true,
                itemObject: jsonObject
            });
        }

        // Academic Professional Qualifications
        if (item.academicProfessionalQualifications) {
            let jsonObject = {
                'academicProfessional': {
                    repeater: '#apqRepAcademicProfessional',
                    txtInfo: '',
                    collectionField: 'academicProfessionalQualificationsInfo',
                    collectionFieldTxT: 'academicProfessionalQualificationsTxT'
                }
            }

            state.push({
                order: item.academicProfessionalQualificationsOrder,
                state: "AcademicProfessionalQualifications",
                itemsArrayCheck: true,
                itemsArray: validationAcademicProfessionalQualifications,
                itemsObjectCheck: true,
                itemObject: jsonObject
            });
        }

        // English Language Proficiency
        if (item.englishLanguageProficiency) {
            let jsonObject = {}

            state.push({
                order: item.englishLanguageProficiencyOrder,
                state: "englishLanguageProficiency",
                itemsArrayCheck: true,
                itemsArray: validationEnglishLanguageProficiency,
                itemsObjectCheck: false,
                itemObject: jsonObject
            });
        }

        // IT Profiency
        if (item.itProficiency) {
            let jsonObject = {}

            state.push({
                order: item.itProficiencyOrder,
                state: "itProficiency",
                itemsArrayCheck: true,
                itemsArray: validationItProficiency,
                itemsObjectCheck: false,
                itemObject: jsonObject
            });
        }

        // Declarations
        let jsonObject = {}

        state.push({
            order: state.length + 1,
            state: "declarations",
            itemsArrayCheck: true,
            itemsArray: validactionDeclarations,
            itemsObjectCheck: false,
            itemObject: jsonObject
        });
    })

    console.log(state)
    wixData.insert('Catch', { array: state }, { "suppressAuth": true, "suppressHooks": true })

    // ===================== Buttons functionality
    // Next
    $w('#pdNext').onClick(() => validationState(validationPersonalDetails));
    $w('#rrNext').onClick(() => validationState(validationRoles));
    $w('#weNext').onClick(() => validationState(validationWE));
    $w('#apqNext').onClick(() => validationState(validationAcademicProfessionalQualifications));
    $w('#elpNext').onClick(() => validationState(validationEnglishLanguageProficiency));
    $w('#itpNext').onClick(() => validationState(validationItProficiency));
    $w('#dNext').onClick(() => validationState(validactionDeclarations));

    // Previous
    $w('#rrPrevious').onClick(() => changeState("Previous"));
    $w('#wePrevious').onClick(() => changeState("Previous"));
    $w('#apqPrevious').onClick(() => changeState("Previous"));
    $w('#elpPrevious').onClick(() => changeState("Previous"));
    $w('#itpPrevious').onClick(() => changeState("Previous"));
    $w('#dPrevious').onClick(() => {
        const number = state.length - 1;
        const nextState = state.find(item => item.order == number);

        if (nextState !== undefined) $w('#formStages').changeState(nextState.state);
        else $w('#formStages').changeState('declarations');
    });

    // ===================== Roles & Responsabilities
    // Roles & Responsabilities
    $w('#rrRepRoleResponsabilities').data = currentRoleResponsabilitiesData;
    $w('#rrRepRoleResponsabilities').onItemReady(($item, itemData, index) => {
        const rrFieldsId = ['#rrRole', '#rrResponsabilities', '#rrDeliverables'];

        $item('#rrRole').onInput(() => {
            itemData.rrRole = $item('#rrRole').value;
            saveWorkExperienceInfo('#rrRepRoleResponsabilities', rrFieldsId, 'rolesResponsibilities', 'Current Role And Responsability', 'currentRoleAndResponsabilities');
        });
        $item('#rrResponsabilities').onInput(() => {
            itemData.rrResponsabilities = $item('#rrResponsabilities').value;
            saveWorkExperienceInfo('#rrRepRoleResponsabilities', rrFieldsId, 'rolesResponsibilities', 'Current Role And Responsability', 'currentRoleAndResponsabilities');
        });
        $item('#rrDeliverables').onInput(() => {
            itemData.rrDeliverables = $item('#rrDeliverables').value;
            saveWorkExperienceInfo('#rrRepRoleResponsabilities', rrFieldsId, 'rolesResponsibilities', 'Current Role And Responsability', 'currentRoleAndResponsabilities');
        });
        $item('#rrDeleteRoles').onClick(async () => {
            await deleteRepeaterInfo(itemData._id, currentRoleResponsabilitiesData, '#rrRepRoleResponsabilities');
            saveWorkExperienceInfo('#rrRepRoleResponsabilities', rrFieldsId, 'rolesResponsibilities', 'Current Role And Responsability', 'currentRoleAndResponsabilities')
        })
    })

    $w('#rrAddRole').onClick(() => addItemToRepeater(currentRoleResponsabilitiesData, '#rrRepRoleResponsabilities', currentRoleResponsabilitiesItems));

    // PROFESSIONAL ACHIEVEMENTS
    // CHECK
    $w('#rrProfessionalAchievementValidation').onChange(() => {
        if ($w('#rrProfessionalAchievementValidation').value == 'Applicable') {
            $w('#rrProfessionalAchievementsRep').expand();
            $w('#rrAddProfessionalAchievement').expand();

            $w('#rrProfessionalAchievement').required = true;
        } else {
            $w('#rrProfessionalAchievementsRep').collapse();
            $w('#rrAddProfessionalAchievement').collapse();

            $w('#rrProfessionalAchievement').required = false;
        }
    })

    // REPEATER
    $w('#rrProfessionalAchievementsRep').data = professionalAchievementsData;
    $w('#rrProfessionalAchievementsRep').onItemReady(($item, itemData) => {
        const paFieldsId = ['#rrProfessionalAchievement'];

        $item('#rrProfessionalAchievement').onInput(() => {
            itemData.rrProfessionalAchievement = $item('#rrProfessionalAchievement').value;
            saveWorkExperienceInfo('#rrProfessionalAchievementsRep', paFieldsId, 'rolesResponsibilities', 'Professional Achievements', 'professionalAchievements');
        });

        $item('#rrDeleteProfessionalAchievements').onClick(async () => {
            await deleteRepeaterInfo(itemData._id, professionalAchievementsData, '#rrProfessionalAchievementsRep');
            saveWorkExperienceInfo('#rrProfessionalAchievementsRep', paFieldsId, 'rolesResponsibilities', 'Professional Achievements', 'professionalAchievements')
        })
    })

    // ADD
    $w('#rrAddProfessionalAchievement').onClick(() => addItemToRepeater(professionalAchievementsData, '#rrProfessionalAchievementsRep', professionalAchievementsItems));

    // PREVIOUS POSITION
    $w('#rrPreviousPosition').onChange(() => {
        if ($w('#rrPreviousPosition').value == 'Applicable') {
            $w('#rrPositionTitle').expand();
            $w('#rrDateJoinend').expand();
            $w('#rrRolesResponsabilities').expand();

            $w('#rrPositionTitle').required = true;
            $w('#rrDateJoinend').required = true;
            $w('#rrRolesResponsabilities').required = true;
        } else {
            $w('#rrPositionTitle').collapse();
            $w('#rrDateJoinend').collapse();
            $w('#rrRolesResponsabilities').collapse();

            $w('#rrPositionTitleError').hide();
            $w('#rrDateJoinendError').hide();
            $w('#rrRolesResponsabilitiesError').hide();

            $w('#rrPositionTitle').required = false;
            $w('#rrDateJoinend').required = false;
            $w('#rrRolesResponsabilities').required = false;
        }
    })

    // ===================== WORK EXPERIENCE
    // REPEATER
    $w('#repWE').data = workExperienceData;
    $w('#repWE').onItemReady(($item, itemData, index) => {
        const weFieldsId = ['#weOrganisation', '#wePositionTitle', '#weYearOfService', '#weResponsibilities'];
        $item('#weOrganisation').onInput(() => {
            itemData.weOrganisation = $item('#weOrganisation').value;
            saveWorkExperienceInfo('#repWE', weFieldsId, 'workExperience', 'Work', 'workExperience');
        });
        $item('#wePositionTitle').onInput(() => {
            itemData.wePositionTitle = $item('#wePositionTitle').value;
            saveWorkExperienceInfo('#repWE', weFieldsId, 'workExperience', 'Work', 'workExperience');
        });
        $item('#weYearOfService').onInput(() => {
            itemData.weYearOfService = $item('#weYearOfService').value;
            saveWorkExperienceInfo('#repWE', weFieldsId, 'workExperience', 'Work', 'workExperience');
        });
        $item('#weResponsibilities').onInput(() => {
            itemData.weResponsibilities = $item('#weResponsibilities').value;
            saveWorkExperienceInfo('#repWE', weFieldsId, 'workExperience', 'Work', 'workExperience');
        });
        $item('#deleteItem').onClick(async () => {
            await deleteRepeaterInfo(itemData._id, workExperienceData, '#repWE');
            saveWorkExperienceInfo('#repWE', weFieldsId, 'workExperience', 'Work', 'workExperience')
        })
    })

    // ADD
    $w('#adMoreWorkExperience').onClick(() => addItemToRepeater(workExperienceData, '#repWE', workExperienceItems));

    // ===================== ACADEMIC / PROFESSIONAL QUEALIFICATIONS
    $w('#apqRepAcademicProfessional').data = academicProfessionalData;
    $w('#apqRepAcademicProfessional').onItemReady(($item, itemData, index) => {
        const apqFieldsId = ['#apqAcademyInstitution', '#apqCityCountry', '#apqDatesattended', '#apqQualification'];
        $item('#apqAcademyInstitution').onInput(() => {
            itemData.apqAcademyInstitution = $item('#apqAcademyInstitution').value;
            saveWorkExperienceInfo('#apqRepAcademicProfessional', apqFieldsId, 'AcademicProfessionalQualifications', 'Academic/Professional Qualifications', 'academicProfessional');
        });
        $item('#apqCityCountry').onInput(() => {
            itemData.apqCityCountry = $item('#apqCityCountry').value;
            saveWorkExperienceInfo('#apqRepAcademicProfessional', apqFieldsId, 'AcademicProfessionalQualifications', 'Academic/Professional Qualifications', 'academicProfessional');
        });
        $item('#apqDatesattended').onInput(() => {
            itemData.apqDatesattended = $item('#apqDatesattended').value;
            saveWorkExperienceInfo('#apqRepAcademicProfessional', apqFieldsId, 'AcademicProfessionalQualifications', 'Academic/Professional Qualifications', 'academicProfessional');
        });
        $item('#apqQualification').onInput(() => {
            itemData.apqQualification = $item('#apqQualification').value;
            saveWorkExperienceInfo('#apqRepAcademicProfessional', apqFieldsId, 'AcademicProfessionalQualifications', 'Academic/Professional Qualifications', 'academicProfessional');
        });
        $item('#apqDeleteAcademic').onClick(async () => {
            await deleteRepeaterInfo(itemData._id, academicProfessionalData, '#apqRepAcademicProfessional');
            saveWorkExperienceInfo('#apqRepAcademicProfessional', apqFieldsId, 'AcademicProfessionalQualifications', 'Academic/Professional Qualifications', 'academicProfessional');
        })
    })

    // ADD
    $w('#addAPQ').onClick(() => addItemToRepeater(academicProfessionalData, '#apqRepAcademicProfessional', academicProfessionalItems));

    // PREVIOUS POSITION
    $w('#apqEnrolled').onChange(() => {
        if ($w('#apqEnrolled').value == 'Applicable') {
            $w('#apqeAcademyInstitution').expand();
            $w('#apqeCityCountry').expand();
            $w('#apqeDatesAttended').expand();
            $w('#apqeQualification').expand();

            $w('#apqeAcademyInstitution').required = true;
            $w('#apqeCityCountry').required = true;
            $w('#apqeDatesAttended').required = true;
            $w('#apqeQualification').required = true;
        } else {
            $w('#apqeAcademyInstitution').collapse();
            $w('#apqeCityCountry').collapse();
            $w('#apqeDatesAttended').collapse();
            $w('#apqeQualification').collapse();

            $w('#apqeAcademyInstitutionError').hide();
            $w('#apqeCityCountryError').hide();
            $w('#apqeDatesAttendedError').hide();
            $w('#apqeQualificationError').hide();

            $w('#apqeAcademyInstitution').required = false;
            $w('#apqeCityCountry').required = false;
            $w('#apqeDatesAttended').required = false;
            $w('#apqeQualification').required = false;
        }
    })

    // ===================== ENGLISH LANGUAGE PROFICIENCY
    $w('#elpInternationallyRecognised').onChange(() => {
        if ($w('#elpInternationallyRecognised').value == 'Yes') {
            $w('#elpNameOfEnglishQualification').expand();
            $w('#elpAccreditedEndorsedBy').expand();
            $w('#elpCommencementCompletionDate').expand();
            $w('#elpCertificateOfCompletion').expand();

            $w('#elpNameOfEnglishQualification').required = true;
            $w('#elpAccreditedEndorsedBy').required = true;
            $w('#elpCommencementCompletionDate').required = true;
            $w('#elpCertificateOfCompletion').required = true;
        } else {
            $w('#elpNameOfEnglishQualification').collapse();
            $w('#elpAccreditedEndorsedBy').collapse();
            $w('#elpCommencementCompletionDate').collapse();
            $w('#elpCertificateOfCompletion').collapse();

            $w('#elpNameOfEnglishQualificationError').hide();
            $w('#elpAccreditedEndorsedByError').hide();
            $w('#elpCommencementCompletionDateError').hide();
            $w('#elpCertificateOfCompletionError').hide();

            $w('#elpNameOfEnglishQualification').required = false;
            $w('#elpAccreditedEndorsedBy').required = false;
            $w('#elpCommencementCompletionDate').required = false;
            $w('#elpCertificateOfCompletion').required = false;
        }
    })

    // ===================== DECLARATIONS
}

function addItemToRepeater(dataArray, repeaterId, defaultItem) {
    const newItem = {
        _id: (dataArray.length + 1).toString(),
        ...defaultItem
    };

    dataArray.push(newItem);
    $w(repeaterId).data = dataArray;
}

function deleteRepeaterInfo(id, array, repId) {
    const index = array.findIndex(item => item._id === id);
    if (array.length !== 1 && index !== -1) {
        array.splice(index, 1); // modifica directamente el arreglo original
        $w(repId).data = array;
    }
}

function changeState(stateFunction) {
    if (stateFunction == "Next") stateOrder++;
    else stateOrder--;

    const nextState = state.find(item => item.order == stateOrder);
    if (nextState !== undefined) $w('#formStages').changeState(nextState.state);
    else $w('#formStages').changeState('declarations');
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
        if (items == validactionDeclarations) saveInfo();
        else changeState("Next");
    } catch (error) {
        console.log("Validation error:", error.message);
        // Optional: show a global error message if needed
    }
}

function validation(items) {
    let isValid = true;

    items.forEach(async (id) => {
        if (typeof id === "string" && $w(id).required) {
            const input = $w(id);
            const errorTextId = `${id}Error`; // Error text field under each input

            // Clear previous error messages
            if ($w(errorTextId)) {
                $w(errorTextId).text = "";
                $w(errorTextId).hide();
            }

            let errorMessage = "";

            // Validate based on input type
            if (input.type === "$w.TextInput" || input.type === "$w.TextArea" || input.type === "$w.Dropdown" || input.type === "$w.RadioButtonGroup" || input.type === "$w.SignatureInput") {
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
            } else if (input.type === "$w.UploadButton") {
                if (input.value.length === 0) {
                    errorMessage = "Please upload your digital signature";
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
        } else if (typeof id === "object") {
            if (id.validation == '' || $w(id.validation).value == 'Applicable') {
                $w(id.repId).forEachItem(($item, itemData, index) => {
                    id.fieldsId.forEach(fieldId => {
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
            }
        } // else { console.log(`Other Type: ${id} ${typeof item}`) }
    });

    return isValid;
}

async function saveWorkExperienceInfo(repeaterId, fields, nameState, label, jsonAtribute) {
    let summary = "";

    await $w(repeaterId).forEachItem(async ($item, itemData, index) => {
        summary += `\n${label} ${index + 1}:\n`;

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
            stateItem.itemObject[jsonAtribute].txtInfo = summary.trim();
        }
    });
}

async function saveInfo() {
    $w('#formStages').changeState('loading');
    let formData = {};

    // Sort the state items based on their 'order' field
    state.sort((a, b) => a.order - b.order);

    for (const stateItem of state) {
        // Check if 'itemsArrayCheck' is true, and process 'itemsArray'
        if (stateItem.itemsArrayCheck && Array.isArray(stateItem.itemsArray)) {
            stateItem.itemsArray.forEach((fieldId) => {
                if (typeof fieldId === "string" && $w(fieldId).required && fieldId !== '#dSignatureFile' && fieldId !== '#dSignatureSign') {
                    const key = fieldId.replace('#', ''); // Remove '#' symbol
                    const $field = $w(fieldId); // Get the field element

                    // Store the field value or source
                    formData[key] = $field.value || $field.src || "";

                } else if (typeof fieldId === 'object') {
                    const repId = fieldId.repId;
                    const itemObjectInfo = stateItem.itemObject;
                    const foundKey = Object.keys(itemObjectInfo).find(key => itemObjectInfo[key].repeater === repId);
                    const itemObject = foundKey ? itemObjectInfo[foundKey] : null;

                    // Extract the repeater data
                    const repeaterData = $w(itemObject.repeater).data || [];
                    const collectionField = itemObject.collectionField;
                    const workExperienceTxT = itemObject.collectionFieldTxT;

                    // Store the entire repeater data as a JSON structure
                    formData[collectionField] = repeaterData;

                    // String summary of the repeater data
                    let repeaterSummary = itemObject.txtInfo;

                    // Store the repeater summary text
                    formData[workExperienceTxT] = repeaterSummary.trim();
                }
            });
        }
    }

    const dSignatureFile = await $w('#dSignatureFile').uploadFiles()
        .catch((uploadError) => console.log(uploadError));
    formData.dSignatureFile = dSignatureFile[0].fileUrl;

    // EMAIL MESSAGE
    const date = new Date();
    let resultString = `Form Name: ${$w('#title').text}\nName: ${$w('#firstName').value} ${$w('#surname').value}\nEmail: ${$w('#emailAddress').value}\nDate: ${date.toDateString()}`

    // Add fixed fields
    formData.personalDetails = item.personalDetails;
    formData.rolesResponsibilities = item.rolesResponsibilities;
    formData.workExperience = item.workExperience;
    formData.academicProfessionalQualifications = item.academicProfessionalQualifications;
    formData.englishLanguageProficiency = item.englishLanguageProficiency;
    formData.itProficiency = item.itProficiency;

    formData.title = item.title;
    formData.emailMessage = resultString;
    formData.memberId = memberId;
    formData.image = $w('#image').src;
    formData.status = 'Sent';
    formData.additionalInformation = false;
    formData.sendEmailAdditionalInformation = false;
    formData.dApplicantDeclaration = $w('#dApplicantDeclaration').html;
    formData.dResponsibleDeclaration = item.responsibleDeclaration;

    console.log(formData)

    // Insert data into collection
    insertCollection('Formssubmitted', formData).then((itemCollectionId) => {
        const json = {
            formName: item.title,
            name: $w('#firstName').value,
            data: resultString,
            urlWix: 'https://manage.wix.com/dashboard/181a573b-180a-484b-ad92-022b65cd0fb8/admin-pages/admin?referralInfo=viewerNavigation',
        }
        emailForms(json);
        $w('#formStages').changeState('thankYou');
    })

    console.log("formData:", formData);
    console.log("Final String:\n", resultString);
}