import { insertCollection, getFormInfoAfterSave, deleteItemFromCollection } from 'backend/collections.web.js';
import { uploadBase64Image } from 'backend/functions.web.js';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from "wix-members-frontend";
import { emailForms, emailSignRequired, emailPhysicalSignature } from 'backend/email.web.js';
import wixData from 'wix-data';
import { generatePDF } from 'backend/apiIntegration.web.js';

let stateOrder = 1,
    state = [],
    item, memberId, autoSaveId, responsibleDeclaration, currentMemberInfo;

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
    '#addressLine',
    '#city',
    '#postalCode',
    '#country'
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
    { repId: '#apqRepAcademicProfessional', fieldsId: ['#apqAcademyInstitution', '#apqCityCountry', '#apqDatesattended', '#apqQualification', '#apqUpdateAcademicCertificate'], validation: '' },
    '#apqEnrolled',
    '#apqeAcademyInstitution',
    '#apqeCityCountry',
    '#apqeDatesAttended',
    '#apqeQualification',
    '#uploadEducationCertificates'
]

const validationEnglishLanguageProficiency = [
    '#elpWrittenEnglish',
    '#elpSpokenEnglish',
    '#elpPracticeOfEnglish',
    '#elpInternationallyRecognised',
    '#elpNameOfEnglishQualification',
    '#elpAccreditedEndorsedBy',
    '#elpCommencementCompletionDate',
    '#elpCertificateOfCompletion',
    '#uploadEnglishCertificate',
]

const validationItProficiency = [
    '#itpUsageOfOnlinePlatformsPreviously',
    '#itpUnderstandingAndUsageOfIt'
]

const validactionDeclarations = [
    '#dName',
    '#dDesignation',
    '#dDate',
    '#signatureType',
    '#dSignatureFile',
    '#dSignatureFile2'
]

const validactionDeclarations2 = [
    '#responsibleNameDeclaration',
    '#responsibleDateDeclaration',
    '#responsibleSignatureOption',
    '#responsibleSignatureType',
    '#responsibleSign',
    '#responsibleSign2',
    '#responsibleEmailSignature'
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
});

async function getMember() {
    await currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        if (member._id) {
            memberId = member._id;
            let filter = wixData.filter().eq('memberId', member._id);
            $w('#dataset1').setFilter(filter).then(() => {
                $w('#dataset1').onReady(() => {
                    $w('#formStages').changeState('personalDetails');
                    currentMemberInfo = $w('#dataset1').getCurrentItem();
                    console.log('currentMemberInfo', currentMemberInfo)
                    validationState(validationPersonalDetails, false);
                    validationPersonalDetails.push('#applicantType');

                    init();
                })
            })
        }
    }).catch((error) => { console.error(error); });
}

function init() {
    // Get Form Info
    $w('#dynamicDataset').onReady(() => {
        item = $w('#dynamicDataset').getCurrentItem();
        console.log('item', item)

        if (item.available == false || (item.available == true && item.numberOfApplications <= 0)) {
            $w('#formStages').changeState('applicationEnd');
            $w('#saveFormBackLater').collapse();
        }

        getFormInfoAfterSave(item.title, memberId, 'getInfo').then((formInfo) => { if (formInfo) insertFormInfo(formInfo) })

        $w('#dResponsibleDeclaration').html = item.responsibleDeclaration;
        responsibleDeclaration = item.responsibleDeclaration;

        changeHtml();

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

        state.push({
            order: state.length + 1,
            state: "declarations2",
            itemsArrayCheck: true,
            itemsArray: validactionDeclarations2,
            itemsObjectCheck: false,
            itemObject: jsonObject
        });

        console.log('state', state)
    })

    wixData.insert('Catch', { array: state }, { "suppressAuth": true, "suppressHooks": true })

    // ===================== Buttons functionality
    // Next
    $w('#pdNext').onClick(() => validationState(validationPersonalDetails, true));
    $w('#rrNext').onClick(() => validationState(validationRoles, true));
    $w('#weNext').onClick(() => validationState(validationWE, true));
    $w('#apqNext').onClick(() => validationState(validationAcademicProfessionalQualifications, true));
    $w('#elpNext').onClick(() => validationState(validationEnglishLanguageProficiency, true));
    $w('#itpNext').onClick(() => validationState(validationItProficiency, true));
    $w('#dNext').onClick(() => validationState(validactionDeclarations, true));
    $w('#d2Next').onClick(() => validationState(validactionDeclarations2, true));

    // Previous
    $w('#rrPrevious').onClick(() => changeState("Previous"));
    $w('#wePrevious').onClick(() => changeState("Previous"));
    $w('#apqPrevious').onClick(() => changeState("Previous"));
    $w('#elpPrevious').onClick(() => changeState("Previous"));
    $w('#itpPrevious').onClick(() => changeState("Previous"));
    $w('#dPrevious').onClick(() => changeState("Previous"));
    $w('#d2Previous').onClick(() => changeState("Previous"));
    // $w('#dPrevious').onClick(() => {
    //     changeState("Previous")
    //     // const number = state.length - 1;
    //     // const nextState = state.find(item => item.order == number);

    //     // if (nextState !== undefined) $w('#formStages').changeState(nextState.state);
    //     // else $w('#formStages').changeState('declarations');
    // });

    // Personal Information
    $w('#applicantType').onChange(() => {
        if ($w('#applicantType').value == 'Independent – Applicant & their organization') {
            $w('#responsibleNameDeclaration').value = 'Not applicable';
        } else {
            $w('#responsibleNameDeclaration').value = '';
        }

        changeHtml()
    })

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
    $w('#rrProfessionalAchievementValidation').onChange(() => f_rrProfessionalAchievementValidation())

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
    $w('#rrPreviousPosition').onChange(() => f_rrPreviousPosition());

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
    $w('#apqEnrolled').onChange(() => f_apqEnrolled())

    // ===================== ENGLISH LANGUAGE PROFICIENCY
    $w('#elpInternationallyRecognised').onChange(() => f_elpInternationallyRecognised())
    // ===================== DECLARATIONS
    $w('#signatureType').onChange(() => {
        if ($w('#signatureType').value == 'Digital signature') {
            $w('#dSignatureFile').required = true;
            $w('#dSignatureFile2').required = false;

            $w('#dSignatureFileError').hide();
            $w('#dSignatureFile2Error').hide();

            $w('#dSignatureFile').expand();
            $w('#dSignatureFile2').collapse();
        } else {
            $w('#dSignatureFile').required = false;
            $w('#dSignatureFile2').required = true;

            $w('#dSignatureFileError').hide();
            $w('#dSignatureFile2Error').hide();

            $w('#dSignatureFile').collapse();
            $w('#dSignatureFile2').expand();
        }
    })

    $w('#responsibleSignatureType').onChange(() => {
        if ($w('#responsibleSignatureType').value == 'Digital signature') {
            $w('#responsibleSign').required = true;
            $w('#responsibleSign2').required = false;

            $w('#responsibleSignError').hide();
            $w('#responsibleSign2Error').hide();

            $w('#responsibleSign').expand();
            $w('#responsibleSign2').collapse();
        } else {
            $w('#responsibleSign').required = false;
            $w('#responsibleSign2').required = true;

            $w('#responsibleSignError').hide();
            $w('#responsibleSign2Error').hide();

            $w('#responsibleSign').collapse();
            $w('#responsibleSign2').expand();
        }
    })

    $w('#responsibleNameDeclaration').onInput(() => changeHtml())

    $w('#responsibleSignatureOption').onChange(() => {
        if ($w('#responsibleSignatureOption').value == 'Digital Signature') {
            // Sign
            $w('#responsibleSignatureType').expand();
            $w('#responsibleEmailSignature').collapse();

            $w('#responsibleSignatureTypeError').hide();
            $w('#responsibleEmailSignatureError').hide();

            $w('#responsibleSignatureType').required = true;
            $w('#responsibleEmailSignature').required = false;
            $w('#responsibleEmailSignature').required = false;

            // Sign Options
            if ($w('#responsibleSignatureType').value == 'Digital signature') {
                $w('#responsibleSign').expand();
                $w('#responsibleSign2').collapse();

                $w('#responsibleSignError').hide();
                $w('#responsibleSign2Error').hide();

                $w('#responsibleSign').required = true;
                $w('#responsibleSign2').required = false;
            } else {
                $w('#responsibleSign').collapse();
                $w('#responsibleSign2').expand();

                $w('#responsibleSignError').hide();
                $w('#responsibleSign2Error').hide();

                $w('#responsibleSign').required = false;
                $w('#responsibleSign2').required = true;
            }

            // Physical Signature
            // $w('#messagePhysicalSignature').collapse();
        } else if ($w('#responsibleSignatureOption').value == 'Email to director') {
            //Email
            $w('#responsibleSignatureType').collapse();
            $w('#responsibleEmailSignature').expand();

            $w('#responsibleSignatureTypeError').hide();
            $w('#responsibleEmailSignatureError').hide();

            $w('#responsibleSignatureType').required = false;
            $w('#responsibleEmailSignature').required = true;

            // Sign Options
            $w('#responsibleSign').collapse();
            $w('#responsibleSign2').collapse();

            $w('#responsibleSignError').hide();
            $w('#responsibleSign2Error').hide();

            $w('#responsibleSign').required = false;
            $w('#responsibleSign2').required = false;

            // Physical Signature
            // $w('#messagePhysicalSignature').collapse();
        } else if ($w('#responsibleSignatureOption').value == 'Physical Signature') {
            //Email
            $w('#responsibleSignatureType').collapse();
            $w('#responsibleEmailSignature').collapse();

            $w('#responsibleSignatureTypeError').hide();
            $w('#responsibleEmailSignatureError').hide();

            $w('#responsibleSignatureType').required = false;
            $w('#responsibleEmailSignature').required = false;

            // Sign Options
            $w('#responsibleSign').collapse();
            $w('#responsibleSign2').collapse();

            $w('#responsibleSignError').hide();
            $w('#responsibleSign2Error').hide();

            $w('#responsibleSign').required = false;
            $w('#responsibleSign2').required = false;

            // Physical Signature
            // $w('#messagePhysicalSignature').expand();
        }
    })
    // ===================== SAVE INFO
    $w('#saveFormBackLater').onClick(() => {
        saveInfo(false);
    })
}

// =============================================================== ON CHANGE FUNCTIONS
function f_rrProfessionalAchievementValidation() {
    if ($w('#rrProfessionalAchievementValidation').value == 'Applicable') {
        $w('#rrProfessionalAchievementsRep').expand();
        $w('#rrAddProfessionalAchievement').expand();

        $w('#rrProfessionalAchievement').required = true;
    } else {
        $w('#rrProfessionalAchievementsRep').collapse();
        $w('#rrAddProfessionalAchievement').collapse();

        $w('#rrProfessionalAchievement').required = false;
    }
}

function f_rrPreviousPosition() {
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
}

function f_apqEnrolled() {
    if ($w('#apqEnrolled').value == 'Applicable') {
        $w('#apqeAcademyInstitution').expand();
        $w('#apqeCityCountry').expand();
        $w('#apqeDatesAttended').expand();
        $w('#apqeQualification').expand();
        $w('#uploadEducationCertificates').expand();

        $w('#apqeAcademyInstitution').required = true;
        $w('#apqeCityCountry').required = true;
        $w('#apqeDatesAttended').required = true;
        $w('#apqeQualification').required = true;
        $w('#uploadEducationCertificates').required = true;
    } else {
        $w('#apqeAcademyInstitution').collapse();
        $w('#apqeCityCountry').collapse();
        $w('#apqeDatesAttended').collapse();
        $w('#apqeQualification').collapse();
        $w('#uploadEducationCertificates').collapse();

        $w('#apqeAcademyInstitutionError').hide();
        $w('#apqeCityCountryError').hide();
        $w('#apqeDatesAttendedError').hide();
        $w('#apqeQualificationError').hide();
        $w('#uploadEducationCertificatesError').hide();

        $w('#apqeAcademyInstitution').required = false;
        $w('#apqeCityCountry').required = false;
        $w('#apqeDatesAttended').required = false;
        $w('#apqeQualification').required = false;
        $w('#uploadEducationCertificates').required = false;
    }
}

function f_elpInternationallyRecognised() {
    if ($w('#elpInternationallyRecognised').value == 'Yes') {
        $w('#elpNameOfEnglishQualification').expand();
        $w('#elpAccreditedEndorsedBy').expand();
        $w('#elpCommencementCompletionDate').expand();
        $w('#elpCertificateOfCompletion').expand();
        $w('#uploadEnglishCertificate').expand();

        $w('#elpNameOfEnglishQualification').required = true;
        $w('#elpAccreditedEndorsedBy').required = true;
        $w('#elpCommencementCompletionDate').required = true;
        $w('#elpCertificateOfCompletion').required = true;
        // $w('#uploadEnglishCertificate').required = true;
    } else {
        $w('#elpNameOfEnglishQualification').collapse();
        $w('#elpAccreditedEndorsedBy').collapse();
        $w('#elpCommencementCompletionDate').collapse();
        $w('#elpCertificateOfCompletion').collapse();
        $w('#uploadEnglishCertificate').collapse();

        $w('#elpNameOfEnglishQualificationError').hide();
        $w('#elpAccreditedEndorsedByError').hide();
        $w('#elpCommencementCompletionDateError').hide();
        $w('#elpCertificateOfCompletionError').hide();
        // $w('#uploadEnglishCertificateError').hide();

        $w('#elpNameOfEnglishQualification').required = false;
        $w('#elpAccreditedEndorsedBy').required = false;
        $w('#elpCommencementCompletionDate').required = false;
        $w('#elpCertificateOfCompletion').required = false;
        // $w('#uploadEnglishCertificate').required = false;
    }
}

// CHANGE HTML RESPONSIBLE NAME
function changeHtml() {
    const name = $w('#responsibleNameDeclaration').value.trim();

    // Replace placeholder {NAME} with the user's name underlined
    const updatedHtml = responsibleDeclaration.replace('{NAME}', name ? `<u>${name}</u>` : '<u>__________</u>');

    // Set the new HTML to the element
    $w('#dResponsibleDeclaration').html = updatedHtml;
}

// ADD REPEATER
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

function validationState(items, changeStateValidation) {
    try {
        const isValid = validation(items);
        if (!isValid) {
            if (items == validationPersonalDetails) {
                $w('#btCompleteProfile').expand();
            }
            throw new Error("Validation failed");
        }

        // If validation passes, proceed to next step
        if ((items == validactionDeclarations && $w('#applicantType').value == 'Independent – Applicant & their organization') || (items == validactionDeclarations2)) saveInfo(true);
        else if (changeStateValidation) changeState("Next");
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
                    errorMessage = "Please upload your digital document";
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

                        if (!field.value || (field.type !== "$w.UploadButton" && field.value.trim() === "") || (field.type === "$w.UploadButton" && field.value.length === 0)) {
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

// INSERT INFO
function insertFormInfo(formInfo) {
    autoSaveId = formInfo._id;

    state.forEach((stateInfoToSet) => {
        if (stateInfoToSet.state !== 'personalDetails' && stateInfoToSet.state !== 'declarations') {
            stateInfoToSet.itemsArray.forEach(itemsState => {
                if (typeof itemsState === 'string') {
                    const itemBackenName = itemsState.replace('#', '');
                    $w(itemsState).value = formInfo[itemBackenName];

                    if ('f_rrProfessionalAchievementValidation'.includes(itemBackenName)) f_rrProfessionalAchievementValidation();
                    if ('f_elpInternationallyRecognised'.includes(itemBackenName)) f_elpInternationallyRecognised();
                    if ('f_rrPreviousPosition'.includes(itemBackenName)) f_rrPreviousPosition();
                    if ('f_apqEnrolled'.includes(itemBackenName)) f_apqEnrolled();

                } else {
                    const targetRepeater = itemsState.repId;
                    // Find the key where the repeater matches
                    const foundKey = Object.keys(stateInfoToSet.itemObject).find(key => stateInfoToSet.itemObject[key].repeater === targetRepeater);
                    // Optional: get the full object if needed
                    const foundObject = foundKey ? stateInfoToSet.itemObject[foundKey] : null;
                    // repeater 
                    $w(foundObject.repeater).data = formInfo[foundObject.collectionField];
                    // $w(foundObject.repeater).
                    $w(foundObject.repeater).onItemReady(($item, itemData) => {
                        itemsState.fieldsId.forEach((repItemId) => {
                            const itemBackenName = repItemId.replace('#', '');
                            $item(repItemId).value = itemData[itemBackenName];
                        })
                    })
                }
            })
        }
    })
}

async function saveInfo(saveValidation) {
    let documents = [];
    let formData = {};
    let docCounter = 1; // for sequential IDs
    $w('#saveFormBackLater').collapse();

    // Helper to add files to documents array
    function addFilesToDocuments(files) {
        files.forEach(file => {
            documents.push({
                _id: String(docCounter++),
                name: file.originalFileName,
                url: file.fileUrl
            });
        });
    }

    if (saveValidation) {
        $w('#formStages').changeState('loading');
    } else {
        $w('#saveFormBackLater').collapse();
    }

    state.sort((a, b) => a.order - b.order);

    for (const stateItem of state) {
        const excludedFields = [
            '#signatureType', '#dSignatureFile', '#dSignatureFile2',
            '#responsibleSignatureType', '#responsibleSign', '#responsibleSign2'
        ];

        if (stateItem.itemsArrayCheck && Array.isArray(stateItem.itemsArray)) {
            stateItem.itemsArray.forEach((fieldId) => {
                if (typeof fieldId === 'string' && $w(fieldId).required && !excludedFields.includes(fieldId)) {
                    const key = fieldId.replace('#', '');
                    const $field = $w(fieldId);

                    if ($field.value instanceof Date) {
                        const yyyy = $field.value.getFullYear();
                        const mm = String($field.value.getMonth() + 1).padStart(2, '0');
                        const dd = String($field.value.getDate()).padStart(2, '0');
                        formData[key] = `${yyyy}-${mm}-${dd}`;
                    } else {
                        formData[key] = $field.value || $field.src || "";
                    }
                } else if (typeof fieldId === 'object') {
                    const repId = fieldId.repId;
                    const itemObjectInfo = stateItem.itemObject;
                    const foundKey = Object.keys(itemObjectInfo).find(key => itemObjectInfo[key].repeater === repId);
                    const itemObject = itemObjectInfo[foundKey];

                    formData[itemObject.collectionField] = $w(itemObject.repeater).data || [];
                    formData[itemObject.collectionFieldTxT] = itemObject.txtInfo.trim();
                }
            });
        }
    }

    documents.push({
        _id: String(docCounter++),
        name: "Passport",
        url: currentMemberInfo.newField
    });

    // Signer
    if ($w('#signatureType').value === 'Digital signature') {
        const signerFile = await $w('#dSignatureFile').uploadFiles().catch(console.log);
        if (signerFile?.length) {
            formData.dSignatureFile = signerFile[0].fileUrl;
            // addFilesToDocuments(signerFile);
        }
    } else {
        const base64 = await uploadBase64Image($w('#dSignatureFile2').value, `Sign 1 ${formData.passportNo}`);
        formData.dSignatureFile = base64;
    }

    // Responsible
    if ($w('#responsibleSignatureOption').value === 'Digital Signature') {
        if ($w('#responsibleSignatureType').value === 'Digital signature') {
            const responsibleFile = await $w('#responsibleSign').uploadFiles().catch(console.log);
            if (responsibleFile?.length) {
                formData.responsibleSignature = responsibleFile[0].fileUrl;
                // addFilesToDocuments(responsibleFile);
            }
        } else {
            const base64 = await uploadBase64Image($w('#responsibleSign2').value, `Sign 2 ${$w('#responsibleNameDeclaration').value}`);
            formData.responsibleSignature = base64;
        }
    } else {
        formData.passwordEmailSignature = await generatePassword();
        if ($w('#responsibleSignatureOption').value === 'Physical Signature') formData.responsibleSignature = '';
    }

    formData.passwordAdmin = await generatePassword();

    // Upload fields
    const uploadAndCollect = async (selector, key) => {
        const files = await $w(selector).uploadFiles().catch(console.log);
        if (files?.length) {
            const urls = files.map(f => f.fileUrl);
            formData[key] = urls;
            addFilesToDocuments(files);
        }
    };

    if (saveValidation) {
        if ($w('#uploadEducationCertificates').value.length > 0) {
            await uploadAndCollect('#uploadEducationCertificates', 'uploadEducationCertificates');
        }
        if ($w('#uploadEnglishCertificate').value.length > 0) {
            await uploadAndCollect('#uploadEnglishCertificate', 'uploadEnglishCertificate');
        }
    }

    // Repeater upload
    let repeaterUploadPromises = [];
    $w('#apqRepAcademicProfessional').forEachItem(($item) => {
        if (saveValidation) {
            const promise = $item('#apqUpdateAcademicCertificate').uploadFiles()
                .then(files => {
                    addFilesToDocuments(files);
                })
                .catch(err => console.log("Repeater upload error:", err));
            repeaterUploadPromises.push(promise);
        }
    });
    await Promise.all(repeaterUploadPromises);

    // Email string
    const date = new Date();
    const resultString = `Form Name: ${$w('#title').text}
Name: ${$w('#firstName').value} ${$w('#surname').value}
Email: ${$w('#emailAddress').value}
Date: ${date.toDateString()}`;

    let status = 'Sent';
    if ($w('#responsibleSignatureOption').value !== 'Digital Signature') {
        status = 'Signature pending';
    }

    // Add fixed info
    Object.assign(formData, {
        personalDetails: item.personalDetails,
        rolesResponsibilities: item.rolesResponsibilities,
        workExperience: item.workExperience,
        academicProfessionalQualifications: item.academicProfessionalQualifications,
        englishLanguageProficiency: item.englishLanguageProficiency,
        itProficiency: item.itProficiency,

        title: item.title,
        titlePersonalDetails: item.titlePersonalDetails,
        titleRolesResponsibilities: item.titleRolesResponsibilities,
        titleWorkExperience: item.titleWorkExperience,
        titleAcademicProfessionalQualifications: item.titleAcademicProfessionalQualifications,
        titleEnglishLanguageProficiency: item.titleEnglishLanguageProficiency,
        titleItProficiency: item.titleItProficiency,
        titleDeclaration: item.titleDeclaration,

        emailMessage: resultString,
        memberId: memberId,
        image: currentMemberInfo.image,
        status,
        additionalInformation: false,
        sendEmailAdditionalInformation: false,
        dApplicantDeclaration: $w('#dApplicantDeclaration').html,
        dResponsibleDeclaration: $w('#dResponsibleDeclaration').html,
    });

    if ($w('#applicantType').value == 'Independent – Applicant & their organization') {
        formData.responsibleOk = true;
        formData.responsibleSignatureOption = 'Not applicable';
        formData.responsibleNameDeclaration = 'Not applicable';

        const yyyy = $w('#responsibleDateDeclaration').value.getFullYear();
        const mm = String($w('#responsibleDateDeclaration').value.getMonth() + 1).padStart(2, '0');
        const dd = String($w('#responsibleDateDeclaration').value.getDate()).padStart(2, '0');
        formData.responsibleDateDeclaration = `${yyyy}-${mm}-${dd}`;
    }

    if ($w('#responsibleSignatureOption').value == 'Digital Signature') {
        formData.responsibleOk = true;
    } else if ($w('#responsibleSignatureOption').value == 'Physical Signature') {
        // Replace placeholder {NAME} with the user's name underlined
        const updatedHtml = item.responsibleDeclaration.replace('{NAME}', '______________________________________________________');

        formData.dResponsibleDeclaration = updatedHtml;
        formData.responsibleNameDeclaration = '______________________________________________________';
        formData.responsibleDateDeclaration = '______________________________________________________';
    }

    // Save to collection
    if (saveValidation) {
        if ($w('#applicantType').value == 'Independent – Applicant & their organization' || $w('#responsibleSignatureOption').value == 'Digital Signature') {
            // Create PDF
            const applicationPDF = await generatePDF(formData);
            formData.pdf = applicationPDF;

            documents.push({
                _id: String(docCounter++),
                name: `Application - ${item.title}`,
                url: applicationPDF
            });
        }

        // Sort documents alphabetically
        documents.sort((a, b) => a.name.localeCompare(b.name));
        formData.documents = documents;
        
        insertCollection('Formssubmitted', formData).then(async (itemCollectionId) => {
            if ($w('#applicantType').value == 'Independent – Applicant & their organization' || $w('#responsibleSignatureOption').value == 'Digital Signature') {
                emailForms({
                    formName: item.title,
                    name: $w('#firstName').value,
                    data: resultString,
                    urlAdmin: `${wixLocationFrontend.baseUrl}/admin?formId=${itemCollectionId}`,
                    urlApplication: `${wixLocationFrontend.baseUrl}/signature?formId=${itemCollectionId}&adminPass=${formData.passwordAdmin}`,
                });

                $w('#formStages').changeState('thankYou');

            } else if ($w('#responsibleSignatureOption').value == 'Email to director') {
                const urlWix = `${wixLocationFrontend.baseUrl}/signature?formId=${itemCollectionId}&signaturePass=${formData.passwordEmailSignature}`;
                emailSignRequired(formData, urlWix);

                $w('#formStages').changeState('thankYou2');
            } else if ($w('#responsibleSignatureOption').value == 'Physical Signature') {
                // ===================== Code for send pdf
                const applicationPDF = `${wixLocationFrontend.baseUrl}/signature?formId=${itemCollectionId}&signaturePass=${formData.passwordEmailSignature}`;
                emailPhysicalSignature(formData, applicationPDF, wixLocationFrontend.baseUrl);

                $w('#formStages').changeState('thankYou3');
            }

            if (autoSaveId) await deleteItemFromCollection('Formssubmitted', autoSaveId);

        });
    } else {
        $w('#loadingAutoSave').expand();
        await getFormInfoAfterSave(item.title, memberId, 'delete');
        formData.autoSaveInfo = true;

        insertCollection('Formssubmitted', formData).then(() => {
            $w('#loadingAutoSave').collapse();
            $w('#checkAutoCheck').expand();
            setTimeout(() => {
                $w('#checkAutoCheck').collapse();
                $w('#saveFormBackLater').expand();
            }, 5000);
        });
    }
}

function generatePassword(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}