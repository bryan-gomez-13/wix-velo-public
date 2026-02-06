import { generalQuery, insertCollection, createSubmission, updateCollection, getFormInfoAfterSave, deleteItemFromCollection } from 'backend/collections.web.js';
import { uploadBase64Image, documentsString, getFileInfo2, createFolder, updateDescriptionOfFile } from 'backend/functions.web.js';
import wixLocationFrontend from 'wix-location-frontend';
import { currentMember } from "wix-members-frontend";
import wixData from 'wix-data';
import { generatePDF } from 'backend/apiIntegration.web.js';

let option1 = true;
// let variablePDF;

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

const validationEmployerDetails = [
    '#edName',
    '#edAddress',
    '#edTelephoneNumber',
    '#edEmailAddress'
];

const validationRoles = [
    '#currentPositionTitle',
    '#department',
    '#divisionUnit',
    '#dateJoined',
    '#typeOfEmployment',
    '#ifContractValidityPeriod',
    { repId: '#rrRepRoleResponsabilities', fieldsId: ['#rrRole', '#rrResponsabilities', '#rrDeliverables'], validation: '', title: "Roles and responsibilities of the above-mentioned position / title:" },
    '#rrProfessionalAchievementValidation',
    { repId: '#rrProfessionalAchievementsRep', fieldsId: ['#rrProfessionalAchievement'], validation: '#rrProfessionalAchievementValidation', title: "Professional Achievements" },
    '#rrPreviousPosition',
    '#rrPositionTitle',
    '#rrDateJoinend',
    '#rrRolesResponsabilities',
];

const validationWE = [
    { repId: '#repWE', fieldsId: ['#weOrganisation', '#wePositionTitle', '#weYearOfService', '#weResponsibilities'], validation: '', title: "Work Experience" }
]

const validationAcademicProfessionalQualifications = [
    { repId: '#apqRepAcademicProfessional', fieldsId: ['#apqAcademyInstitution', '#apqCityCountry', '#apqDatesattended', '#apqQualification', '#apqUpdateAcademicCertificate'], validation: '', title: "Academic/Professional Qualifications" },
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
    "#doYouKnowAnotherLanguage",
    { repId: '#elRepEnglishLanguageProfiency', fieldsId: ['#elpRepLanguage', '#elpRepWrittenEnglish', '#elpRepSpokenEnglish', '#elpRepPracticeOfEnglish'], validation: '#doYouKnowAnotherLanguage', title: "Language" },
]

const validationItProficiency = [
    '#itpUsageOfOnlinePlatformsPreviously',
    '#itpUnderstandingAndUsageOfIt',
    '#itAccessInternet',
]

const validationReferral = [
    { repId: '#repReferral', fieldsId: ['#refName', '#refAddress', '#refTelephoneNumber', '#refEmailAddress', '#refRelationship'], validation: '', title: "Referral" }
]

const validationAdditionalInformation = [
    { repId: '#repAdditionalInformation', fieldsId: ['#aiQuestion'], validation: '', title: "Additional Information" }
]

const validationAdditionalInformation2 = [
    '#ai2CV',
    '#ai2Field1',
    '#ai2Field2',
    '#ai2Field3',
    '#ai2Field4',
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
    '#responsibleEmailSignature',
    '#responsibleStamp'
]

let workExperienceData = [{ _id: '1', weOrganisation: '', wePositionTitle: '', weYearOfService: '', weResponsibilities: '' }];
let workExperienceItems = { weOrganisation: '', wePositionTitle: '', weYearOfService: '', weResponsibilities: '' };

let currentRoleResponsabilitiesData = [{ _id: '1', rrRole: '', rrResponsabilities: '', rrDeliverables: '' }];
let currentRoleResponsabilitiesItems = { rrRole: '', rrResponsabilities: '', rrDeliverables: '' };

let professionalAchievementsData = [{ _id: '1', rrProfessionalAchievement: '' }];
let professionalAchievementsItems = { rrProfessionalAchievement: '' };

let academicProfessionalData = [{ _id: '1', apqAcademyInstitution: '', apqCityCountry: '', apqDatesattended: '', apqQualification: '' }];
let academicProfessionalItems = { apqAcademyInstitution: '', apqCityCountry: '', apqDatesattended: '', apqQualification: '' };

let elProfiencyData = [{ _id: '1', elpRepLanguage: '', elpRepWrittenEnglish: '', elpRepSpokenEnglish: '', elpRepPracticeOfEnglish: '' }];
let elProfiencyItems = { elpRepLanguage: '', elpRepWrittenEnglish: '', elpRepSpokenEnglish: '', elpRepPracticeOfEnglish: '' };

let referralData = [{ _id: '1', refName: '', refAddress: '', refTelephoneNumber: '', refEmailAddress: '', refRelationship: '' }];
let referralItems = { refName: '', refAddress: '', refTelephoneNumber: '', refEmailAddress: '', refRelationship: '' };

$w.onReady(async function () {
    getMember();
});

function getMember() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        if (member._id) {
            memberId = member._id;
            let filter = wixData.filter().eq('memberId', member._id);
            $w('#dataset1').setFilter(filter).then(() => {
                $w('#dataset1').onReady(() => {
                    currentMemberInfo = $w('#dataset1').getCurrentItem();
                    if (currentMemberInfo.city) {
                        $w('#dDesignation').value = currentMemberInfo.designation
                        validationState(validationPersonalDetails, false);

                        $w('#dName').value = `${currentMemberInfo.firstName} ${currentMemberInfo.surname}`;
                        $w('#dDesignation').value = currentMemberInfo.designation;

                        init();
                    } else {
                        $w('#saveFormBackLater').hide();
                        $w('#formStages').changeState('completeProfile');
                    }
                })
            })
        }
    }).catch((error) => { console.error(error); });
}

function init() {
    // Get Form Info
    $w('#dynamicDataset').onReady(async () => {
        item = $w('#dynamicDataset').getCurrentItem();
        if (item.available == false || item.available == null) wixLocationFrontend.to('/');

        $w('#rrPreviousPosition').label = (item.previousPositionLabel) ? item.previousPositionLabel : 'Previous position / title';

        if (item.available == false || (item.available == true && item.numberOfApplications <= 0)) {
            $w('#formStages').changeState('applicationEnd');
            $w('#saveFormBackLater').hide();
        }

        if (item.accessToInternet) {
            $w('#itAccessInternet').expand();
            $w('#itAccessInternet').required = true;
        }

        if (item.uploadButton1) {
            $w('#ai2Field1').expand();
            $w('#ai2Field1').label = item.uploadButton1Label;
            $w('#ai2Field1').required = true;
        }

        if (item.uploadButton2) {
            $w('#ai2Field2').expand();
            $w('#ai2Field2').label = item.uploadButton2Label;
            $w('#ai2Field2').required = true;
        }

        if (item.textInput1) {
            $w('#ai2Field3').expand();
            $w('#ai2Field3').label = item.textInput1Label;
            $w('#ai2Field3').required = true;
        }

        if (item.textInput2) {
            $w('#ai2Field4').expand();
            $w('#ai2Field4').label = item.textInput2Label;
            $w('#ai2Field4').required = true;
        }

        const searchFormOnMember = currentMemberInfo.forms?.find(formHystoryInfo => formHystoryInfo.formId == item._id);

        if (searchFormOnMember) {
            $w('#formStages').changeState('applicationEnd2');
            $w('#saveFormBackLater').hide();
        } else {
            $w('#formStages').changeState('personalDetails');
        }

        getFileInfo2(item.firstImage).then((firstImage) => { item.firstImageUrl = firstImage; })

        getFileInfo2(item.secondImage).then((secondImage) => { item.secondImageUrl = secondImage; })

        getFormInfoAfterSave(item.title, memberId, 'getInfo').then((formInfo) => { if (formInfo) insertFormInfo(formInfo) })

        $w('#dResponsibleDeclaration').html = item.responsibleDeclaration;
        responsibleDeclaration = item.responsibleDeclaration;

        changeHtml();

        // personalDetails
        if (item.personalDetails) state.push({
            order: item.personalDetailsOrder,
            state: "personalDetails",
            itemsArrayCheck: true,
            itemsArray: validationPersonalDetails,
            itemsObjectCheck: false,
            itemObject: null,
            title: item.titlePersonalDetails
        });

        // employerDetails
        if (item.employerDetails) {
            let jsonObject = {}

            state.push({
                order: item.employerDetailsOrder,
                state: "employerDetails",
                itemsArrayCheck: true,
                itemsArray: validationEmployerDetails,
                itemsObjectCheck: false,
                itemObject: jsonObject,
                title: item.titleEmployerDetails
            });
        }

        // rolesResponsibilities
        if (item.rolesResponsibilities) {
            const typeOfEmploymentOptions = item.typeOfEmployment.map(typeOfEmployment => ({ label: typeOfEmployment, value: typeOfEmployment }));
            $w('#typeOfEmployment').options = typeOfEmploymentOptions;
            let jsonObject = {
                'currentRoleAndResponsabilities': {
                    repeater: '#rrRepRoleResponsabilities',
                    txtInfo: '',
                    collectionField: 'currentRolesAndResponsabilitiesInfo',
                    collectionFieldTxT: 'currentRolesAndResponsabilitiesInfoTxT',
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
                itemObject: jsonObject,
                title: item.titleRolesResponsibilities
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
                itemObject: jsonObject,
                title: item.titleWorkExperience
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
                itemObject: jsonObject,
                title: item.titleAcademicProfessionalQualifications
            });
        }

        // English Language Proficiency
        if (item.englishLanguageProficiency) {
            let jsonObject = {
                'englishLanguageProficiency': {
                    repeater: '#elRepEnglishLanguageProfiency',
                    txtInfo: '',
                    collectionField: 'englishLanguageProficiencyInfo',
                    collectionFieldTxT: 'englishLanguageProficiencyTxT',
                }
            }

            state.push({
                order: item.englishLanguageProficiencyOrder,
                state: "englishLanguageProficiency",
                itemsArrayCheck: true,
                itemsArray: validationEnglishLanguageProficiency,
                itemsObjectCheck: true,
                itemObject: jsonObject,
                title: item.titleEnglishLanguageProficiency
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
                itemObject: jsonObject,
                title: item.titleItProficiency
            });
        }

        // Referal
        if (item.referral) {
            let jsonObject = {
                'referral': {
                    repeater: '#repReferral',
                    txtInfo: '',
                    collectionField: 'referralInfo',
                    collectionFieldTxT: 'referralTxT'
                }
            }

            state.push({
                order: item.referralOrder,
                state: "referral",
                itemsArrayCheck: true,
                itemsArray: validationReferral,
                itemsObjectCheck: true,
                itemObject: jsonObject,
                title: item.titleReferral
            });
        }

        // Additional Information
        if (item.additionalInformation) {
            let jsonObject = {
                'additionalInformation': {
                    repeater: '#repAdditionalInformation',
                    txtInfo: '',
                    collectionField: 'additionalInformationInfo',
                    collectionFieldTxT: 'additionalInformationTxT'
                }
            }

            state.push({
                order: item.additionalInformationOrder,
                state: "additionalInformation",
                itemsArrayCheck: true,
                itemsArray: validationAdditionalInformation,
                itemsObjectCheck: true,
                itemObject: jsonObject,
                title: item.titleAdditionalInformation
            });

            const questions = await processQuestions(item.questions);
            $w('#repAdditionalInformation').data = questions;

            $w('#repAdditionalInformation').onItemReady(($item, itemData, index) => {
                const aiFieldsId = ['#aiQuestion'];

                // Set the question label and max allowed words
                $item('#aiQuestion').label = itemData.question;

                // Save maxWords from the JSON
                const maxWords = itemData.maxWords;

                // Word counter text element (optional)
                // Create a text element in the repeater with ID: #txtWordCount
                $item('#txtWordCount').text = `0 / ${maxWords} words`;

                // Handle typing
                $item('#aiQuestion').onInput(() => {
                    let text = $item('#aiQuestion').value;

                    // Count words
                    let words = text.trim().split(/\s+/).filter(Boolean);

                    // If exceeds maxWords, block and trim
                    if (words.length > maxWords) {
                        // Keep only allowed words
                        words = words.slice(0, maxWords);
                        // Replace the field value with allowed words only
                        const trimmedText = words.join(" ");
                        $item('#aiQuestion').value = trimmedText;
                    }

                    // Update counter text
                    $item('#txtWordCount').text = `${words.length} / ${maxWords} words`;

                    // Save info
                    itemData.aiQuestion = $item('#aiQuestion').value;
                    saveWorkExperienceInfo('#repAdditionalInformation', aiFieldsId, 'additionalInformation', 'Question', 'additionalInformation', true);
                });
            });
        }

        // IT Profiency
        if (item.additionalInformation2) {
            let jsonObject = {}

            state.push({
                order: item.additionalInformation2Order,
                state: "additionalInformation2",
                itemsArrayCheck: true,
                itemsArray: validationAdditionalInformation2,
                itemsObjectCheck: false,
                itemObject: jsonObject,
                title: item.additionalInformation2Title
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
    })

    // ===================== Buttons functionality
    // Next
    $w('#pdNext').onClick(() => validationState(validationPersonalDetails, true));
    $w('#edNext').onClick(() => validationState(validationEmployerDetails, true));
    $w('#rrNext').onClick(() => validationState(validationRoles, true));
    $w('#weNext').onClick(() => validationState(validationWE, true));
    $w('#apqNext').onClick(() => validationState(validationAcademicProfessionalQualifications, true));
    $w('#elpNext').onClick(() => validationState(validationEnglishLanguageProficiency, true));
    $w('#itpNext').onClick(() => validationState(validationItProficiency, true));
    $w('#refNext').onClick(() => validationState(validationReferral, true));
    $w('#aiNext').onClick(() => validationState(validationAdditionalInformation, true));
    $w('#dNext').onClick(() => validationState(validactionDeclarations, true));
    $w('#d2Next').onClick(() => validationState(validactionDeclarations2, true));
    $w('#ai2Next').onClick(() => validationState(validationAdditionalInformation2, true));

    // Previous
    $w('#edPrevious').onClick(() => changeState("Previous"));
    $w('#rrPrevious').onClick(() => changeState("Previous"));
    $w('#wePrevious').onClick(() => changeState("Previous"));
    $w('#apqPrevious').onClick(() => changeState("Previous"));
    $w('#elpPrevious').onClick(() => changeState("Previous"));
    $w('#itpPrevious').onClick(() => changeState("Previous"));
    $w('#refPrevious').onClick(() => changeState("Previous"));
    $w('#aiPrevious').onClick(() => changeState("Previous"));
    $w('#dPrevious').onClick(() => changeState("Previous"));
    $w('#d2Previous').onClick(() => changeState("Previous"));
    $w('#ai2Previous').onClick(() => changeState("Previous"));
    // $w('#dPrevious').onClick(() => {
    //     changeState("Previous")
    //     // const number = state.length - 1;
    //     // const nextState = state.find(item => item.order == number);

    //     // if (nextState !== undefined) $w('#formStages').changeState(nextState.state);
    //     // else $w('#formStages').changeState('declarations');
    // });

    // ===================== Roles & Responsabilities
    $w('#typeOfEmployment').onChange(() => {
        if ($w('#typeOfEmployment').value == 'Contract') $w('#ifContractValidityPeriod').required = true, $w('#ifContractValidityPeriod').expand();
        else $w('#ifContractValidityPeriod').required = false, $w('#ifContractValidityPeriod').collapse();
    })

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
    $w('#elpInternationallyRecognised').onChange(() => f_elpInternationallyRecognised());
    $w('#doYouKnowAnotherLanguage').onChange(() => f_elOtherLanguage());

    // REPEATER
    $w('#elRepEnglishLanguageProfiency').data = elProfiencyData;
    $w('#elRepEnglishLanguageProfiency').onItemReady(($item, itemData, index) => {
        const elFieldsId = ['#elpRepLanguage', '#elpRepWrittenEnglish', '#elpRepSpokenEnglish', '#weResponsibilities'];
        $item('#elpRepLanguage').onInput(() => {
            itemData.elpRepLanguage = $item('#elpRepLanguage').value;
            saveWorkExperienceInfo('#elRepEnglishLanguageProfiency', elFieldsId, 'englishLanguageProficiency', 'Other Language', 'englishLanguageProficiency');
        });
        $item('#elpRepWrittenEnglish').onChange(() => {
            itemData.elpRepWrittenEnglish = $item('#elpRepWrittenEnglish').value;
            saveWorkExperienceInfo('#elRepEnglishLanguageProfiency', elFieldsId, 'englishLanguageProficiency', 'Other Language', 'englishLanguageProficiency');
        });
        $item('#elpRepSpokenEnglish').onChange(() => {
            itemData.elpRepSpokenEnglish = $item('#elpRepSpokenEnglish').value;
            saveWorkExperienceInfo('#elRepEnglishLanguageProfiency', elFieldsId, 'englishLanguageProficiency', 'Other Language', 'englishLanguageProficiency');
        });
        $item('#elpRepPracticeOfEnglish').onChange(() => {
            itemData.elpRepPracticeOfEnglish = $item('#elpRepPracticeOfEnglish').value;
            saveWorkExperienceInfo('#elRepEnglishLanguageProfiency', elFieldsId, 'englishLanguageProficiency', 'Other Language', 'englishLanguageProficiency');
        });
        $item('#elDeleteItem').onClick(async () => {
            await deleteRepeaterInfo(itemData._id, elProfiencyData, '#elRepEnglishLanguageProfiency');
            saveWorkExperienceInfo('#elRepEnglishLanguageProfiency', elFieldsId, 'englishLanguageProficiency', 'Other Language', 'englishLanguageProficiency')
        })
    })

    // ADD
    $w('#addElProfiency').onClick(() => addItemToRepeater(elProfiencyData, '#elRepEnglishLanguageProfiency', elProfiencyItems));

    // ===================== WORK EXPERIENCE
    // REPEATER
    $w('#repReferral').data = referralData;
    $w('#repReferral').onItemReady(($item, itemData, index) => {
        const refFieldsId = ['#refName', '#refAddress', '#refTelephoneNumber', '#refEmailAddress', '#refRelationship'];
        $item('#refName').onInput(() => {
            itemData.refName = $item('#refName').value;
            saveWorkExperienceInfo('#repReferral', refFieldsId, 'referral', 'Referral', 'referral');
        });
        $item('#refAddress').onInput(() => {
            itemData.refAddress = $item('#refAddress').value;
            saveWorkExperienceInfo('#repReferral', refFieldsId, 'referral', 'Referral', 'referral');
        });
        $item('#weYearOfService').onInput(() => {
            itemData.weYearOfService = $item('#weYearOfService').value;
            saveWorkExperienceInfo('#repReferral', refFieldsId, 'referral', 'Referral', 'referral');
        });
        $item('#refEmailAddress').onInput(() => {
            itemData.refEmailAddress = $item('#refEmailAddress').value;
            saveWorkExperienceInfo('#repReferral', refFieldsId, 'referral', 'Referral', 'referral');
        });
        $item('#refRelationship').onInput(() => {
            itemData.refRelationship = $item('#refRelationship').value;
            saveWorkExperienceInfo('#repReferral', refFieldsId, 'referral', 'Referral', 'referral');
        });
        $item('#deleteReferal').onClick(async () => {
            await deleteRepeaterInfo(itemData._id, referralData, '#repReferral');
            saveWorkExperienceInfo('#repReferral', refFieldsId, 'referral', 'Referral', 'referral')
        })
    })

    // ADD
    $w('#addReferral').onClick(() => addItemToRepeater(referralData, '#repReferral', referralItems));

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

    // ===================== DECLARATIONS
    $w('#signatureType').onChange(() => {
        if ($w('#signatureType').value == 'Upload Signature') {
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

        $w('#dSignatureFile').resetValidityIndication();
        $w('#dSignatureFile2').resetValidityIndication();
    })

    $w('#responsibleSignatureType').onChange(() => {
        if ($w('#responsibleSignatureType').value == 'Upload Signature') {
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

        $w('#dSignatureFile').resetValidityIndication();
        $w('#dSignatureFile2').resetValidityIndication();
    })

    $w('#responsibleNameDeclaration').onInput(() => changeHtml())

    $w('#responsibleSignatureOption').onChange(() => {
        if ($w('#responsibleSignatureOption').value == 'Digital Signature') {
            // Sign
            $w('#dResponsibleDeclaration').expand();
            $w('#responsibleNameDeclaration').expand();
            $w('#dResponsibleDeclaration').expand();
            $w('#responsibleDateDeclaration').expand();
            $w('#responsibleSignatureType').expand();
            $w('#responsibleStamp').expand();
            $w('#responsibleEmailSignature').collapse();

            $w('#responsibleSignatureTypeError').hide();
            $w('#responsibleEmailSignatureError').hide();
            $w('#responsibleSignatureTypeError').collapse();
            $w('#responsibleEmailSignatureError').collapse();
            $w('#responsibleStampError').hide();

            $w('#responsibleNameDeclaration').required = true;
            $w('#responsibleDateDeclaration').required = true;
            $w('#responsibleSignatureType').required = true;
            $w('#responsibleEmailSignature').required = false;
            $w('#responsibleStamp').required = true;

            // Sign Options
            if ($w('#responsibleSignatureType').value == 'Upload Signature') {
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

            $w('#responsibleSign').resetValidityIndication();
            $w('#responsibleSign2').resetValidityIndication();

            // Download and Sign Physically
            // $w('#messagePhysicalSignature').collapse();
        } else if ($w('#responsibleSignatureOption').value == 'Email to director') {
            //Email
            $w('#responsibleNameDeclaration').collapse();
            $w('#dResponsibleDeclaration').collapse();
            $w('#responsibleDateDeclaration').collapse();
            $w('#responsibleSignatureType').collapse();
            $w('#responsibleStamp').collapse();
            $w('#responsibleEmailSignature').expand();

            $w('#responsibleSignatureTypeError').hide();
            $w('#responsibleEmailSignatureError').hide();
            $w('#responsibleSignatureTypeError').collapse();
            $w('#responsibleEmailSignatureError').collapse();
            $w('#responsibleStampError').hide();

            $w('#responsibleNameDeclaration').required = false;
            $w('#responsibleDateDeclaration').required = false;
            $w('#responsibleSignatureType').required = false;
            $w('#responsibleEmailSignature').required = true;
            $w('#responsibleStamp').required = false;

            // Sign Options
            $w('#responsibleSign').collapse();
            $w('#responsibleSign2').collapse();

            $w('#responsibleSignError').hide();
            $w('#responsibleSign2Error').hide();

            $w('#responsibleSign').required = false;
            $w('#responsibleSign2').required = false;

            // Download and Sign Physically
            // $w('#messagePhysicalSignature').collapse();
        } else if ($w('#responsibleSignatureOption').value == 'Download and Sign Physically') {
            //Email
            $w('#responsibleNameDeclaration').collapse();
            $w('#dResponsibleDeclaration').collapse();
            $w('#responsibleDateDeclaration').collapse();
            $w('#responsibleSignatureType').collapse();
            $w('#responsibleEmailSignature').collapse();
            $w('#responsibleStamp').expand();

            $w('#responsibleSignatureTypeError').hide();
            $w('#responsibleEmailSignatureError').hide();
            $w('#responsibleSignatureTypeError').collapse();
            $w('#responsibleEmailSignatureError').collapse();
            $w('#responsibleStampError').show();

            $w('#responsibleSignatureType').required = false;
            $w('#responsibleEmailSignature').required = false;
            $w('#responsibleStamp').required = true;

            // Sign Options
            $w('#responsibleSign').collapse();
            $w('#responsibleSign2').collapse();

            $w('#responsibleSignError').hide();
            $w('#responsibleSign2Error').hide();

            $w('#responsibleNameDeclaration').required = false;
            $w('#responsibleDateDeclaration').required = false;
            $w('#responsibleSign').required = false;
            $w('#responsibleSign2').required = false;

            // Download and Sign Physically
            // $w('#messagePhysicalSignature').expand();
        }
    })
    // ===================== SAVE INFO
    $w('#saveFormBackLater').onClick(() => {
        saveInfo(false);
    })
}

export function processQuestions(questionsArray) {
    // Sort the array by the numeric "order" field
    const sorted = questionsArray.sort((a, b) => a.order - b.order);

    // Add the "_id" field (string version of "order")
    const updated = sorted.map(item => {
        return {
            ...item,
            _id: String(item.order) // Convert order to string
        };
    });

    return updated;
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

function f_elOtherLanguage() {
    if ($w('#doYouKnowAnotherLanguage').value == 'Applicable') {
        $w('#elRepEnglishLanguageProfiency').expand();
        $w('#addElProfiency').expand();

        $w('#elpRepLanguage').required = true;
        $w('#elpRepWrittenEnglish').required = true;
        $w('#elpRepSpokenEnglish').required = true;
        $w('#elpRepPracticeOfEnglish').required = true;
    } else {
        $w('#elRepEnglishLanguageProfiency').collapse();
        $w('#addElProfiency').collapse();

        $w('#elpRepLanguageError').hide();
        $w('#elpRepWrittenEnglishError').hide();
        $w('#elpRepSpokenEnglishError').hide();
        $w('#elpRepPracticeOfEnglishError').hide();

        $w('#elpRepLanguage').required = false;
        $w('#elpRepWrittenEnglish').required = false;
        $w('#elpRepSpokenEnglish').required = false;
        $w('#elpRepPracticeOfEnglish').required = false;
    }
}

function f_elpInternationallyRecognised() {
    if ($w('#elpInternationallyRecognised').value == 'Yes') {
        $w('#elpNameOfEnglishQualification').expand();
        $w('#elpAccreditedEndorsedBy').expand();
        $w('#elpCommencementCompletionDate').expand();
        $w('#elpCertificateOfCompletion').expand();
        $w('#uploadEnglishCertificate').expand();
        $w('#boxInternationallyEnglish').expand();

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
        $w('#boxInternationallyEnglish').collapse();

        $w('#elpNameOfEnglishQualificationError').hide();
        $w('#elpAccreditedEndorsedByError').hide();
        $w('#elpCommencementCompletionDateError').hide();
        $w('#elpCertificateOfCompletionError').hide();

        $w('#elpNameOfEnglishQualification').required = false;
        $w('#elpAccreditedEndorsedBy').required = false;
        $w('#elpCommencementCompletionDate').required = false;
        $w('#elpCertificateOfCompletion').required = false;
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
    if (nextState !== undefined) $w('#formStages').changeState(nextState.state), $w('#formStages').scrollTo();
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
        if ((items == validactionDeclarations && !item.staffSignature) || (items == validactionDeclarations2)) saveInfo(true);
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
                    if ($w(errorTextId).collapsed) $w(errorTextId).expand();
                }
            }
        } else if (typeof id === "object") {
            if (id.validation == '' || $w(id.validation).value == 'Applicable') {
                $w(id.repId).forEachItem(($item, itemData, index) => {
                    id.fieldsId.forEach(fieldId => {
                        const field = $item(fieldId);

                        if (!field.value || (field.type === "$w.RadioButtonGroup" && field.value === null) || (field.type !== "$w.UploadButton" && field.value.trim() === "") || (field.type === "$w.UploadButton" && field.value.length === 0)) {
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
        }
    });

    return isValid;
}

async function saveWorkExperienceInfo(repeaterId, fields, nameState, label, jsonAtribute, ai) {
    if (option1) {
        let tableHTML = "";
        // Header Color
        const headerColor = "#000000";
        // const background = "#0A3170";

        // === Step 1: Extract data from the repeater ===
        const rows = [];

        await $w(repeaterId).forEachItem(async ($item, itemData, index) => {
            const row = {};
            for (const fieldId of fields) {
                const $input = $item(fieldId);
                const fieldLabel = $input?.label || fieldId.replace('#', '');
                const value = $input?.value || "";
                row[fieldLabel] = value;
            }
            rows.push(row);
        });

        // === Step 2: Generate the HTML table ===
        if (rows.length > 0) {
            if (ai) {
                tableHTML = await buildTableHTML(rows)
            } else {
                const headers = Object.keys(rows[0]); // Use first row keys as column headers
                // === linear without jumps
                tableHTML += `<table style='width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;'><thead><tr style='background:#f0f0f0;'>${headers.map(header => `<th style='border:1px solid #000; padding:8px; text-align:left;'>${header}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(header => `<td style='border:1px solid #000; padding:8px;'>${row[header] || ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

            }
        }

        // === Step 3: Save result back into the state object ===
        state.forEach((stateItem) => {
            if (stateItem.state === nameState) {
                stateItem.itemObject[jsonAtribute].txtInfo = tableHTML.trim();
            }
        });
    } else {
        let summary = "";

        await $w(repeaterId).forEachItem(async ($item, itemData, index) => {
            summary += `\n${label} ${index + 1}:\n`;

            for (const fieldId of fields) {
                const $input = $item(fieldId); // Get field in this repeater item
                const label = $input?.label || fieldId.replace('#', ''); // Use label or fallback to ID
                const value = $input?.value || ""; // Handle input or image field

                summary += `${label}: ${value}\n`;
            }

            // summary += "\n";
        });

        state.forEach((stateItem) => {
            if (stateItem.state === nameState) {
                stateItem.itemObject[jsonAtribute].txtInfo = summary.trim();
            }
        });
    }
}

export function buildTableHTML(dataArray) {
    let tableHTML = "";

    dataArray.forEach(obj => {
        // Get the first key of the object as the label
        const label = Object.keys(obj)[0];

        // Get the value associated with that label
        const value = obj[label];

        // Append formatted HTML using label and value
        tableHTML += `
            <p style="margin:2px 0; text-align:left;"><strong>${label.toUpperCase()}</strong></p>
            <p style="margin:0 0 8px 0; text-align:left;">${value}</p>
        `;
    });

    return tableHTML;
}

// INSERT INFO
function insertFormInfo(formInfo) {
    autoSaveId = formInfo._id;

    console.log(0, state)

    state.forEach((stateInfoToSet) => {
        if (stateInfoToSet.state !== 'personalDetails' && stateInfoToSet.state !== 'declarations') {
            stateInfoToSet.itemsArray.forEach(itemsState => {
                if (typeof itemsState === 'string') {
                    const itemBackenName = itemsState.replace('#', '');
                    const $control = $w(itemsState);
                    let valueToSet = formInfo[itemBackenName];

                    // If value comes from autosave as ISO string and control is DatePicker,
                    // convert it back to a Date object so the control renders correctly.
                    if ($control.type === "$w.DatePicker" && typeof valueToSet === "string" && valueToSet) {
                        const parsedDate = new Date(valueToSet);
                        if (!isNaN(parsedDate.getTime())) {
                            valueToSet = parsedDate;
                        }
                    }

                    $control.value = valueToSet;

                    // Restore UI state for fields that control visibility/requirements of others
                    if (itemBackenName === 'rrProfessionalAchievementValidation') f_rrProfessionalAchievementValidation();
                    if (itemBackenName === 'elpInternationallyRecognised') f_elpInternationallyRecognised();
                    if (itemBackenName === 'rrPreviousPosition') f_rrPreviousPosition();
                    if (itemBackenName === 'apqEnrolled') f_apqEnrolled();
                    if (itemBackenName === 'doYouKnowAnotherLanguage') f_elOtherLanguage();
                    // Re-apply state-dependent UI for employment type when loading saved data
                    if (itemBackenName === 'typeOfEmployment') {
                        if ($w('#typeOfEmployment').value === 'Contract') {
                            $w('#ifContractValidityPeriod').required = true;
                            $w('#ifContractValidityPeriod').expand();
                        } else {
                            $w('#ifContractValidityPeriod').required = false;
                            $w('#ifContractValidityPeriod').collapse();
                        }
                    }

                } else {
                    const targetRepeater = itemsState.repId;
                    // Find the key where the repeater matches (backend format)
                    const foundKey = Object.keys(stateInfoToSet.itemObject).find(
                        key => stateInfoToSet.itemObject[key].repeater === targetRepeater
                    );
                    const foundObject = foundKey ? stateInfoToSet.itemObject[foundKey] : null;

                    // Prefer backend collectionField if present (final submission),
                    // otherwise fall back to autosave key based on repeater id.
                    let repeaterData = [];
                    if (foundObject && Array.isArray(formInfo[foundObject.collectionField])) {
                        repeaterData = formInfo[foundObject.collectionField];

                        // Restore pre-generated summary / HTML (txtInfo) when it exists in the backend,
                        // so we don't lose that JSON representation for the repeater.
                        if (foundObject.collectionFieldTxT && typeof formInfo[foundObject.collectionFieldTxT] === "string") {
                            stateInfoToSet.itemObject[foundKey].txtInfo = formInfo[foundObject.collectionFieldTxT];
                        }
                    } else {
                        const repKey = targetRepeater.replace('#', '');
                        if (Array.isArray(formInfo[repKey])) {
                            repeaterData = formInfo[repKey];
                        }
                    }

                    $w(targetRepeater).data = repeaterData || [];

                    $w(targetRepeater).onItemReady(($item, itemData) => {
                        itemsState.fieldsId.forEach((repItemId) => {
                            const itemBackenName = repItemId.replace('#', '');
                            const $repControl = $item(repItemId);
                            let repValue = itemData[itemBackenName];

                            // Normalize DatePicker values for repeater items as well
                            if ($repControl.type === "$w.DatePicker" && typeof repValue === "string" && repValue) {
                                const parsedDate = new Date(repValue);
                                if (!isNaN(parsedDate.getTime())) {
                                    repValue = parsedDate;
                                }
                            }

                            $repControl.value = repValue;
                        })
                    })
                }
            })
        }
    })
}

async function saveInfo(saveValidation) {
    // AUTO-SAVE MODE (saveValidation === false)
    // Only stores basic information, does NOT upload documents or generate PDFs.
    if (!saveValidation) {
        let formData = {};

        // Iterate over state and store only simple field values,
        // without uploads or additional async calls that might fail.
        state.forEach((stateItem) => {
            if (stateItem.itemsArrayCheck && Array.isArray(stateItem.itemsArray)) {
                stateItem.itemsArray.forEach((fieldId) => {
                    // Simple fields "#id"
                    if (typeof fieldId === "string") {
                        try {
                            const key = fieldId.replace('#', '');
                            const $field = $w(fieldId);

                            // Some components don't have .value (e.g. images),
                            // so we wrap access in try/catch and only save if it exists.
                            if ($field && "value" in $field) {
                                let value = $field.value;

                                // Normalize DatePicker values to ISO string for autosave,
                                // so they are consistent when loaded back.
                                if ($field.type === "$w.DatePicker" && value instanceof Date) {
                                    value = value.toISOString();
                                }

                                if (value !== undefined && value !== null && value !== "") {
                                    formData[key] = value;
                                }
                            }
                        } catch (e) {
                            // Ignore fields that are not present in the DOM yet.
                        }
                    }
                    // Repeaters declared as objects { repId, fieldsId, ... }
                    else if (typeof fieldId === "object" && fieldId.repId) {
                        try {
                            const repId = fieldId.repId;
                            const repKey = repId.replace('#', '');
                            formData[repKey] = $w(repId).data || [];
                        } catch (e) {
                            // If the repeater does not exist at this moment, skip it.
                        }
                    }
                });
            }
        });

        // Minimal metadata required
        formData.memberId = memberId;
        formData.memberCollection = currentMemberInfo?._id;
        formData.title = item.title;
        formData.autoSaveInfo = true;

        $w('#loadingAutoSave').expand();
        await getFormInfoAfterSave(item.title, memberId, 'delete');

        insertCollection('Formssubmitted', formData).then(() => {
            $w('#loadingAutoSave').collapse();
            $w('#checkAutoCheck').expand();
            setTimeout(() => {
                $w('#checkAutoCheck').collapse();
                $w('#saveFormBackLater').show();
            }, 5000);
        });

        // Do nothing else in auto-save mode.
        return;
    }

    // FINAL SUBMISSION MODE (saveValidation === true)
    let documents = [];
    let formData = {};
    let docCounter = 1;
    $w('#saveFormBackLater').hide();

    // ========= UI State =========
    let folderId = '';
    if (saveValidation) {
        $w('#formStages').changeState('loading');

        folderId = await createFolder(currentMemberInfo.folderId, item.title, true);
        $w('#slider').value = 25;
    }

    // === Helper Functions ===
    const addFilesToDocuments = async (files) => {
        await Promise.all(
            files.map(async (file) => {
                const json = {
                    _id: file.fileName,
                    parentFolderId: folderId
                };

                // Update description (async)
                await updateDescriptionOfFile(json);

                // Push document info to the array
                documents.push({
                    _id: String(docCounter++),
                    name: file.originalFileName,
                    url: file.fileUrl
                });
            })
        );
    };

    const formatDate = (dateObj) => {
        if (!(dateObj instanceof Date)) return "";
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatDateDDMMYYYY = (dateObj) => {
        if (!(dateObj instanceof Date)) return "";
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const yyyy = dateObj.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const getCheckbox = (isChecked) => isChecked ? '☑' : '☐';

    const generateCheckboxOptions = (selectedValue, options) => {
        return options.map(opt => {
            const isSelected = opt === selectedValue;
            return `<span style='margin-right:15px;'>${getCheckbox(isSelected)} ${opt}</span>`;
        }).join('');
    };

    const uploadAndCollect = async (selector, key) => {
        const files = await $w(selector).uploadFiles().catch(console.log);
        if (files?.length) {
            const urls = files.map(f => { return { url: f.fileUrl, fileName: f.fileName } });

            if (key == 'ai2CV') formData[key] = urls[0].url;
            else formData[key] = urls;

            addFilesToDocuments(files);
        }
    };

    // ====== Collect form fields ======
    state.sort((a, b) => a.order - b.order);

    const excludedFields = [
        '#signatureType', '#dSignatureFile', '#dSignatureFile2',
        '#responsibleSignatureType', '#responsibleSign', '#responsibleSign2'
    ];

    let htmlPersonalDetails = "";
    let htmlBody = "";
    let currentTableRows = ""; // Para acumular filas de tabla antes de cerrarla

    const customSections = new Set(['englishLanguageProficiency', 'itProficiency', 'referral', 'additionalInformation']);

    for (const stateItem of state) {
        // ===== VALIDATION additionalInformation2
        if (stateItem.state === "additionalInformation2") {
            const q1Value = $w('#ai2Field3').value || "";
            const q2Value = $w('#ai2Field4').value || "";
            const hasData = q1Value.trim() || q2Value.trim();

            if (!hasData) {
                continue;
            }
        }

        // ===== SECTION TITLES =====
        const skipCustomTitle = customSections.has(stateItem.state);

        if (option1 && !["declarations", "declarations2"].includes(stateItem.state) && !skipCustomTitle) {
            // === HTML OUTPUT MODE ===
            const titleHTML = `<p style='color:#0A3170; font-weight:bold; font-size:16px; margin-bottom:15px;'>${stateItem.title}</p> `;
            if (stateItem.state === "personalDetails") htmlPersonalDetails += titleHTML;
            else htmlBody += titleHTML;
        } else if (!["declarations", "declarations2"].includes(stateItem.state) && !skipCustomTitle) {
            // === PLAIN TEXT OUTPUT MODE ===
            const titleText = `${stateItem.title.toUpperCase()}\n`;
            if (stateItem.state === "personalDetails") htmlPersonalDetails += titleText;
            else htmlBody += `\n${titleText}`;
        }

        // Iniciar tabla para rolesResponsibilities
        if (stateItem.state === "rolesResponsibilities" && option1) {
            currentTableRows = "";
        }

        if (stateItem.itemsArrayCheck && Array.isArray(stateItem.itemsArray)) {
            for (const fieldId of stateItem.itemsArray) {

                // === CASE 1: Simple string fields ===
                if (typeof fieldId === 'string' && !excludedFields.includes(fieldId)) {
                    const $field = $w(fieldId);
                    const key = fieldId.replace('#', '');

                    // Get field value (format date if needed)
                    const value = $field.value instanceof Date ?
                        formatDate($field.value) :
                        $field.value || $field.src || "";

                    // Save to formData (guardar todos los campos, no solo los requeridos)
                    if ($field.required || value) {
                        formData[key] = value;
                    }

                    // Label formatting (keep case, only bold)
                    const label = $field.label ? $field.label : key;

                    // Omitir el campo #image en la sección personalDetails (no mostrar en HTML)
                    if (fieldId === '#image' && stateItem.state === "personalDetails") {
                        // Continuar al siguiente campo sin agregar HTML
                        continue;
                    }

                    if (option1 && !["declarations", "declarations2"].includes(stateItem.state)) {

                        // === PERSONAL DETAILS (same line)
                        if (stateItem.state === "personalDetails") {
                            htmlPersonalDetails += `<p style="margin:2px 0; text-align:left;"><strong>${label.toUpperCase()}:</strong> ${value}</p>`;
                        }
                        // === ROLES & RESPONSIBILITIES - SPECIAL FORMAT ===
                        else if (stateItem.state === "rolesResponsibilities") {
                            // Type of Employment con checkboxes
                            if (fieldId === '#typeOfEmployment') {
                                const employmentOptions = ['Permanent', 'Contract', 'Part-time'];
                                const formattedValue = generateCheckboxOptions(value, employmentOptions);
                                currentTableRows += `<tr><td style='padding:5px; border:none;'><strong>Type of employment:</strong></td><td style='padding:5px; border:none;'>${formattedValue}</td></tr> `;
                            }
                            // Date joined DD/MM/YYYY
                            else if (fieldId === '#dateJoined') {
                                const dateValue = $field.value instanceof Date ? formatDateDDMMYYYY($field.value) : value;
                                currentTableRows += `<tr><td style='padding:5px; border:none;'><strong>Date joined:</strong> <span style='font-weight:normal;'>(DD/MM/YYYY)</span></td><td style='padding:5px; border:none; border-bottom:1px solid #000;'>${dateValue}</td></tr> `;
                            }
                            // Previous Position with checkboxes (only show, table add later)
                            else if (fieldId === '#rrPreviousPosition') {
                                const isApplicable = value === 'Applicable';
                                htmlBody += `<p style='margin:20px 0 10px 0; text-decoration:underline;'><strong>Previous position / title within AFC:</strong> <span style='margin-left:15px;'>${getCheckbox(isApplicable)} Applicable</span> <span style='margin-left:15px;'>${getCheckbox(!isApplicable)} Not Applicable</span></p> `;
                            }
                            // Previous Position fields - save in formData table add late
                            else if (['#rrPositionTitle', '#rrDateJoinend', '#rrRolesResponsabilities'].includes(fieldId)) {
                                // Ya se guardó en formData arriba, solo falta agregar a la tabla después
                            }
                            //  rolesResponsibilities fields
                            else if (['#currentPositionTitle', '#department', '#divisionUnit', '#ifContractValidityPeriod'].includes(fieldId)) {
                                currentTableRows += `<tr><td style='padding:5px; border:none;'><strong>${label}:</strong></td><td style='padding:5px; border:none; border-bottom:1px solid #000;'>${value}</td></tr> `;
                            }
                        }
                        // === WORK EXPERIENCE ===
                        else if (stateItem.state === "workExperience") {
                            // Show title
                        }
                        // === ACADEMIC PROFESSIONAL QUALIFICATIONS ===
                        else if (stateItem.state === "AcademicProfessionalQualifications") {
                            // Enrolled with checkboxes
                            if (fieldId === '#apqEnrolled') {
                                htmlBody += `<p style='margin-bottom:10px;'>Have you enrolled in a similar Education Programme? If yes, please indicate below:</p>`;
                            }
                        }
                        // === ENGLISH LANGUAGE PROFICIENCY ===
                        else if (stateItem.state === "englishLanguageProficiency") {
                            // Only title
                        }
                        // === IT PROFICIENCY ===
                        else if (stateItem.state === "itProficiency") {
                            // Only title
                        }
                        // === ADDITIONAL INFORMATION 2
                        else if (stateItem.state === "additionalInformation2") {
                            // Solo mostrar Q1 (#ai2Field3) y Q2 (#ai2Field4)
                            // NO mostrar campos de upload (#ai2CV, #ai2Field1, #ai2Field2)
                            if (fieldId === '#ai2Field3' || fieldId === '#ai2Field4') {
                                // Solo mostrar si tiene valor
                                if (value && value.trim()) {
                                    htmlBody += `<p style="margin:2px 0; text-align:left;"><strong>${label.toUpperCase()}</strong></p><p style="margin:0 0 8px 0; text-align:left;">${value}</p> `;
                                }
                            }
                        }
                        // === DEFAULT FORMAT ===
                        else {
                            htmlBody += `<p style="margin:2px 0; text-align:left;"><strong>${label.toUpperCase()}</strong></p><p style="margin:0 0 8px 0; text-align:left;">${value}</p> `;
                        }

                    } else if (!["declarations", "declarations2"].includes(stateItem.state)) {
                        // === TEXT OUTPUT MODE ===
                        const lineText = `${label.toUpperCase()}: ${value}\n`;
                        if (stateItem.state === "personalDetails") htmlPersonalDetails += lineText;
                        else htmlBody += lineText;
                    }

                    // === CASE 2: Repeater-like objects ===
                } else if (typeof fieldId === 'object') {
                    const { repId, title } = fieldId;
                    const itemObjectInfo = stateItem.itemObject;
                    const foundKey = Object.keys(itemObjectInfo).find(
                        key => itemObjectInfo[key].repeater === repId
                    );

                    if (foundKey) {
                        const itemObject = itemObjectInfo[foundKey];
                        const repeaterData = $w(itemObject.repeater).data || [];

                        // Save to formData
                        formData[itemObject.collectionField] = repeaterData;
                        formData[itemObject.collectionFieldTxT] = itemObject.txtInfo.trim();

                        if (option1 && !["declarations", "declarations2"].includes(stateItem.state)) {
                            // Roles and Responsibilities repeater
                            if (repId == '#rrRepRoleResponsabilities') {
                                // Cerrar tabla anterior si existe
                                if (currentTableRows) {
                                    htmlBody += `<table style='width:100%; border-collapse:collapse; margin-bottom:15px;'>${currentTableRows}</table> `;
                                    currentTableRows = "";
                                }
                                htmlBody += `<p style='margin:15px 0 10px 0;'><strong>Roles and responsibilities of the above-mentioned position / title:</strong></p> `;
                                htmlBody += itemObject.txtInfo + ' ';
                            }
                            // Professional Achievements
                            else if (repId == '#rrProfessionalAchievementsRep') {
                                const achievementsData = repeaterData || [];
                                htmlBody += `<table style='width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;'><tr><td colspan='3' style='border:1px solid #000; padding:8px; background:#f0f0f0;'><strong>Professional Achievements (please indicate if not applicable)</strong></td></tr>${achievementsData.map(achievement => `<tr><td colspan='3' style='border:1px solid #000; padding:8px;'>${achievement.rrProfessionalAchievement || ''}</td></tr>`).join('')}</table> `;
                            }
                            // Work Experience
                            else if (repId == '#repWE') {
                                htmlBody += `<p style='margin-bottom:10px;'>Describe your previous working experiences before</p> `;
                                htmlBody += itemObject.txtInfo + ' ';
                            }
                            // Academic Professional Qualifications
                            else if (repId == '#apqRepAcademicProfessional') {
                                htmlBody += itemObject.txtInfo + ' ';

                                // Enrolled section
                                if ($w('#apqEnrolled').value === 'Applicable') {
                                    const enrolledData = $w('#apqeAcademyInstitution').value ? [{
                                        apqeAcademyInstitution: $w('#apqeAcademyInstitution').value,
                                        apqeCityCountry: $w('#apqeCityCountry').value,
                                        apqeDatesAttended: $w('#apqeDatesAttended').value,
                                        apqeQualification: $w('#apqeQualification').value
                                    }] : [];

                                    if (enrolledData.length > 0) {
                                        htmlBody += `<p style='margin-bottom:10px;'>Have you enrolled in a similar Education Programme? If yes, please indicate below:</p> `;
                                        htmlBody += `<table style='width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;'><thead><tr style='background:#f0f0f0;'><th style='border:1px solid #000; padding:8px; text-align:left;'>Academy Institution</th><th style='border:1px solid #000; padding:8px; text-align:left;'>City & Country</th><th style='border:1px solid #000; padding:8px; text-align:left;'>Dates attended</th><th style='border:1px solid #000; padding:8px; text-align:left;'>Qualification</th></tr></thead><tbody>${enrolledData.map(item => `<tr><td style='border:1px solid #000; padding:8px;'>${item.apqeAcademyInstitution || ''}</td><td style='border:1px solid #000; padding:8px;'>${item.apqeCityCountry || ''}</td><td style='border:1px solid #000; padding:8px;'>${item.apqeDatesAttended || ''}</td><td style='border:1px solid #000; padding:8px;'>${item.apqeQualification || ''}</td></tr>`).join('')}</tbody></table> `;
                                    }
                                }
                            }
                            // Referral y Additional Information
                            else if (repId == '#repReferral' || repId == '#repAdditionalInformation') {
                                // Se manejan en la sección especial después del loop
                            }
                            // Other Languages (English Language Proficiency repeater)
                            else if (repId == '#elRepEnglishLanguageProfiency') {
                                // 
                            } else {
                                htmlBody += itemObject.txtInfo + ' ';
                            }
                        } else if (!["declarations", "declarations2"].includes(stateItem.state)) {
                            htmlBody += `${(title || foundKey).toUpperCase()}\n${itemObject.txtInfo.trim()}\n`;
                        }
                    }

                }
            }
        }

        // close table rolesResponsibilities
        if (stateItem.state === "rolesResponsibilities" && option1) {
            if (currentTableRows) {
                htmlBody += `<table style='width:100%; border-collapse:collapse; margin-bottom:15px;'>${currentTableRows}</table> `;
                currentTableRows = "";
            }

            // Add table pervious prosition
            if ($w('#rrPreviousPosition').value === 'Applicable') {
                let previousPositionRows = "";
                if ($w('#rrPositionTitle').value) {
                    previousPositionRows += `<tr><td style='padding:5px; border:none;'><strong>Position / title:</strong></td><td style='padding:5px; border:none; border-bottom:1px solid #000;'>${$w('#rrPositionTitle').value}</td></tr> `;
                }
                if ($w('#rrDateJoinend').value) {
                    const dateValue = $w('#rrDateJoinend').value instanceof Date ? formatDateDDMMYYYY($w('#rrDateJoinend').value) : $w('#rrDateJoinend').value;
                    previousPositionRows += `<tr><td style='padding:5px; border:none;'><strong>Date joined:</strong> <span style='font-weight:normal;'>(DD/MM/YYYY)</span></td><td style='padding:5px; border:none; border-bottom:1px solid #000;'>${dateValue}</td></tr> `;
                }
                if ($w('#rrRolesResponsabilities').value) {
                    previousPositionRows += `<tr><td style='padding:5px; border:none; vertical-align:top;'><strong>Roles and responsibilities:</strong></td><td style='padding:5px; border:none; border-bottom:1px solid #000;'>${$w('#rrRolesResponsabilities').value}</td></tr> `;
                }
                if (previousPositionRows) {
                    htmlBody += `<table style='width:100%; border-collapse:collapse; margin-bottom:20px;'>${previousPositionRows}</table> `;
                }
            }
        }

        // === SPECIAL SESSIONS ===
        if (option1 && !["declarations", "declarations2"].includes(stateItem.state)) {
            // English Language Proficiency
            if (stateItem.state === "englishLanguageProficiency") {
                const englishTitle = stateItem.title || 'English language proficiency';
                // Remove numbers
                const cleanEnglishTitle = englishTitle.replace(/^\d+\.\s*/, '');
                htmlBody += `<p style='color:#0A3170; font-weight:bold; font-size:16px; margin:30px 0 5px 0;'>${cleanEnglishTitle}</p> `;
                htmlBody += `<p style='margin-bottom:15px; font-size:14px;'>Please tick whichever is applicable</p> `;
                htmlBody += `<table style='width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;'> `;

                // Written English
                const writtenOptions = ['Beginner', 'Intermediate', 'Advanced'];
                const writtenValue = $w('#elpWrittenEnglish').value || '';
                htmlBody += `<tr><td style='padding:8px; border:1px solid #000;'><strong>Written English</strong></td><td style='padding:8px; border:1px solid #000; text-align:center;'>${generateCheckboxOptions(writtenValue, writtenOptions)}</td></tr> `;

                // Spoken English
                const spokenOptions = ['Beginner', 'Intermediate', 'Advanced'];
                const spokenValue = $w('#elpSpokenEnglish').value || '';
                htmlBody += `<tr><td style='padding:8px; border:1px solid #000;'><strong>Spoken English</strong></td><td style='padding:8px; border:1px solid #000; text-align:center;'>${generateCheckboxOptions(spokenValue, spokenOptions)}</td></tr> `;

                // Practice of English
                const practiceOptions = ['Daily', 'Weekly', 'Monthly', 'Never'];
                const practiceValue = $w('#elpPracticeOfEnglish').value || '';
                htmlBody += `<tr><td style='padding:8px; border:1px solid #000;'><strong>Practice of English</strong></td><td style='padding:8px; border:1px solid #000; text-align:center;'>${generateCheckboxOptions(practiceValue, practiceOptions)}</td></tr> `;

                // Internationally Recognised
                const intlValue = $w('#elpInternationallyRecognised').value || '';
                const isYes = intlValue === 'Yes';
                htmlBody += `<tr><td style='padding:8px; border:1px solid #000; vertical-align:top;'><strong>Internationally recognised English qualifications</strong></td><td style='padding:8px; border:1px solid #000;'><div style='text-align:center; margin-bottom:10px;'><span style='margin-right:15px;'>${getCheckbox(isYes)} Yes</span><span>${getCheckbox(!isYes)} No</span></div> `;

                if (isYes) {
                    htmlBody += `<div style='margin-left:20px;'><p style='margin:5px 0;'>If yes, please complete the following :</p><p style='margin:5px 0;'>a) Name of English qualification: <span style='border-bottom:1px solid #000; display:inline-block; min-width:200px;'>${$w('#elpNameOfEnglishQualification').value || ''}</span></p><p style='margin:5px 0;'>b) Accredited / endorsed by: <span style='border-bottom:1px solid #000; display:inline-block; min-width:200px;'>${$w('#elpAccreditedEndorsedBy').value || ''}</span></p><p style='margin:5px 0;'>c) Commencement & completion Date: <span style='border-bottom:1px solid #000; display:inline-block; min-width:200px;'>${$w('#elpCommencementCompletionDate').value || ''}</span></p><p style='margin:5px 0;'>d) Certificate of completion (score / grade): <span style='border-bottom:1px solid #000; display:inline-block; min-width:200px;'>${$w('#elpCertificateOfCompletion').value || ''}</span></p></div> `;
                }
                htmlBody += `</td></tr></table> `;

                // Other Languages section
                if ($w('#doYouKnowAnotherLanguage').value === 'Applicable') {
                    const otherLanguagesData = $w('#elRepEnglishLanguageProfiency').data || [];
                    if (otherLanguagesData.length > 0) {
                        // Language checkboxes row
                        const languages = otherLanguagesData.map(lang => lang.elpRepLanguage).filter(Boolean);
                        if (languages.length > 0) {
                            htmlBody += `<p style='margin:20px 0 10px 0;'><strong>Other Languages:</strong> `;
                            languages.forEach((lang, idx) => {
                                htmlBody += `<span style='margin-right:15px;'>${getCheckbox(true)} ${lang}</span>`;
                            });
                            htmlBody += `</p> `;
                        }

                        // Languages proficiency table
                        htmlBody += `<table style='width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;'><thead><tr style='background:#f0f0f0;'><th style='border:1px solid #000; padding:8px; text-align:left;'>Language</th><th style='border:1px solid #000; padding:8px; text-align:left;'>Written</th><th style='border:1px solid #000; padding:8px; text-align:left;'>Spoken</th><th style='border:1px solid #000; padding:8px; text-align:left;'>Practice</th></tr></thead><tbody>`;
                        otherLanguagesData.forEach(lang => {
                            if (lang.elpRepLanguage) {
                                const writtenOptions = ['Beginner', 'Intermediate', 'Advanced'];
                                const spokenOptions = ['Beginner', 'Intermediate', 'Advanced'];
                                const practiceOptions = ['Daily', 'Weekly', 'Monthly', 'Never'];
                                htmlBody += `<tr><td style='border:1px solid #000; padding:8px;'>${lang.elpRepLanguage || ''}</td><td style='border:1px solid #000; padding:8px; text-align:center;'>${generateCheckboxOptions(lang.elpRepWrittenEnglish || '', writtenOptions)}</td><td style='border:1px solid #000; padding:8px; text-align:center;'>${generateCheckboxOptions(lang.elpRepSpokenEnglish || '', spokenOptions)}</td><td style='border:1px solid #000; padding:8px; text-align:center;'>${generateCheckboxOptions(lang.elpRepPracticeOfEnglish || '', practiceOptions)}</td></tr> `;
                            }
                        });
                        htmlBody += `</tbody></table> `;
                    }
                }
            }

            // IT Proficiency
            if (stateItem.state === "itProficiency") {
                const itTitle = stateItem.title || 'IT proficiency';
                // Remove numbers
                const cleanItTitle = itTitle.replace(/^\d+\.\s*/, '');
                htmlBody += `<p style='color:#0A3170; font-weight:bold; font-size:16px; margin:30px 0 15px 0;'>${cleanItTitle}</p> `;
                htmlBody += `<table style='width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;'> `;

                // Usage of online platforms
                const usageValue = $w('#itpUsageOfOnlinePlatformsPreviously').value || '';
                const isUsageYes = usageValue === 'Yes';
                htmlBody += `<tr><td style='padding:8px; border:1px solid #000;'><strong>Usage of online platforms previously</strong></td><td style='padding:8px; border:1px solid #000; text-align:center;'><span style='margin-right:15px;'>${getCheckbox(isUsageYes)} Yes</span><span>${getCheckbox(!isUsageYes)} No</span></td></tr> `;

                // Understanding and usage of IT
                const understandingOptions = ['Beginner', 'Intermediate', 'Advanced'];
                const understandingValue = $w('#itpUnderstandingAndUsageOfIt').value || '';
                htmlBody += `<tr><td style='padding:8px; border:1px solid #000;'><strong>Understanding and usage of IT</strong></td><td style='padding:8px; border:1px solid #000; text-align:center;'>${generateCheckboxOptions(understandingValue, understandingOptions)}</td></tr> `;

                // Access to internet connection in home country
                if ($w('#itAccessInternet').required || $w('#itAccessInternet').value) {
                    const accessValue = $w('#itAccessInternet').value || '';
                    const isAccessYes = accessValue === 'Yes';
                    htmlBody += `<tr><td style='padding:8px; border:1px solid #000;'><strong>Access to internet connection in home country</strong></td><td style='padding:8px; border:1px solid #000; text-align:center;'><span style='margin-right:15px;'>${getCheckbox(isAccessYes)} Yes</span><span>${getCheckbox(!isAccessYes)} No</span></td></tr> `;
                }

                htmlBody += `</table> `;
            }

            // Referral
            if (stateItem.state === "referral" && stateItem.itemObject) {
                const referralTitle = stateItem.title || 'Referral';
                // Remove Numbers
                const cleanReferralTitle = referralTitle.replace(/^\d+\.\s*/, '');
                htmlBody += `<p style='color:#0A3170; font-weight:bold; font-size:16px; margin:30px 0 15px 0;'>${cleanReferralTitle}</p> `;

                // get txtInfo of itemObject
                const referralItemObject = stateItem.itemObject.referral;
                if (referralItemObject && referralItemObject.txtInfo) {
                    htmlBody += referralItemObject.txtInfo.trim() + ' ';
                }
            }

            // Additional Information
            if (stateItem.state === "additionalInformation" && stateItem.itemObject) {
                const additionalInfoTitle = stateItem.title || 'Additional information';
                // Remove Numbers
                const cleanAdditionalInfoTitle = additionalInfoTitle.replace(/^\d+\.\s*/, '');
                htmlBody += `<p style='color:#0A3170; font-weight:bold; font-size:16px; margin:30px 0 15px 0;'>${cleanAdditionalInfoTitle}</p> `;

                // Get txtInfo from itemObject
                const additionalInfoItemObject = stateItem.itemObject.additionalInformation;
                if (additionalInfoItemObject && additionalInfoItemObject.txtInfo) {
                    htmlBody += additionalInfoItemObject.txtInfo.trim() + ' ';
                }
            }
        }
    }

    // Add fixed passport file
    const fileName = currentMemberInfo.newField.replace('wix:image://v1/', '').split('/')[0];
    const jsonPassport = {
        fileName,
        originalFileName: "Passport",
        fileUrl: currentMemberInfo.newField
    }
    await addFilesToDocuments([jsonPassport])

    // documents.push({
    //     _id: String(docCounter++),
    //     name: "Passport",
    //     url: currentMemberInfo.newField
    // });

    // === Handle Signatures ===
    // Applicant
    if ($w('#signatureType').value === 'Upload Signature') {
        const signerFile = await $w('#dSignatureFile').uploadFiles().catch(console.log);
        if (signerFile?.length) formData.dSignatureFile = signerFile[0].fileUrl;
    } else {
        formData.dSignatureFile = await uploadBase64Image($w('#dSignatureFile2').value, `Sign 1 ${formData.passportNo}`);
    }

    // Responsible
    if (item.staffSignature) {
        if ($w('#responsibleSignatureOption').value === 'Digital Signature') {
            if ($w('#responsibleSignatureType').value === 'Upload Signature') {
                const responsibleFile = await $w('#responsibleSign').uploadFiles().catch(console.log);
                if (responsibleFile?.length) formData.responsibleSignature = responsibleFile[0].fileUrl;
            } else {
                formData.responsibleSignature = await uploadBase64Image(
                    $w('#responsibleSign2').value,
                    `Sign 2 ${$w('#responsibleNameDeclaration').value}`
                );
            }
        } else {
            formData.passwordEmailSignature = await generatePassword();
            formData.responsibleSignature = ($w('#responsibleSignatureOption').value === 'Download and Sign Physically') ? '' : formData.responsibleSignature;
        }
    }

    // Admin Password
    formData.passwordAdmin = await generatePassword();

    // === Upload conditional files ===
    if (item.staffSignature && $w('#responsibleStamp').required) {
        const stampFile = await $w('#responsibleStamp').uploadFiles().catch(console.log);
        formData.responsibleStamp = stampFile?.length ? await getFileInfo2(stampFile[0].fileUrl) : '';
    } else {
        formData.responsibleStamp = '';
    }

    if (saveValidation) {
        if ($w('#uploadEducationCertificates').value.length) {
            await uploadAndCollect('#uploadEducationCertificates', 'uploadEducationCertificates');
        }
        if ($w('#uploadEnglishCertificate').value.length) {
            await uploadAndCollect('#uploadEnglishCertificate', 'uploadEnglishCertificate');
        }

        if ($w('#ai2CV').value.length) {
            await uploadAndCollect('#ai2CV', 'ai2CV');
        }

        if ($w('#ai2Field1').value.length) {
            await uploadAndCollect('#ai2Field1', 'ai2Field1');
        }

        if ($w('#ai2Field2').value.length) {
            await uploadAndCollect('#ai2Field2', 'ai2Field2');
        }
    }

    // === Repeater Uploads in Parallel ===
    const repeaterUploadPromises = [];
    if (saveValidation) {
        $w('#apqRepAcademicProfessional').forEachItem(($item) => {
            repeaterUploadPromises.push(
                $item('#apqUpdateAcademicCertificate')
                .uploadFiles()
                .then(files => addFilesToDocuments(files))
                .catch(err => console.log("Repeater upload error:", err))
            );
        });
    }
    await Promise.all(repeaterUploadPromises);

    // === Email String & Status ===
    const date = new Date();
    const resultString = `Form Name: ${$w('#title').text}
Name: ${$w('#firstName').value} ${$w('#surname').value}
Email: ${$w('#emailAddress').value}
Date: ${date.toDateString()}`;

    let status = ($w('#responsibleSignatureOption').value !== 'Digital Signature') ? 'Signature pending' : 'Sent';

    // === Assign Fixed Info ===
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
        memberCollection: currentMemberInfo._id,
        image: currentMemberInfo.image,
        status,
        additionalInformation: false,
        sendEmailAdditionalInformation: false,
        dApplicantDeclaration: $w('#dApplicantDeclaration').html,
        dResponsibleDeclaration: $w('#dResponsibleDeclaration').html,

        cover: item.firstImageUrl,
        endImage: item.secondImageUrl,

        folderId,
        rrPreviousPositionLabel: (item.previousPositionLabel) ? item.previousPositionLabel : 'Previous position / title',

        htmlPersonalDetails,
        htmlBody,
    });

    // === Responsible Declaration Handling ===
    if (!item.staffSignature) {
        formData.responsibleOk = true;
        formData.responsibleSignatureOption = 'Not applicable';
        formData.responsibleNameDeclaration = 'Not applicable';
        formData.responsibleDateDeclaration = formatDate($w('#responsibleDateDeclaration').value);
    }

    if ($w('#responsibleSignatureOption').value === 'Download and Sign Physically') {
        formData.dResponsibleDeclaration = item.responsibleDeclaration.replace('{NAME}', '______________________________________________________');
        formData.responsibleNameDeclaration = '______________________________________________________';
        formData.responsibleDateDeclaration = '______________________________________________________';
    }

    if ($w('#responsibleSignatureOption').value === 'Digital Signature') {
        formData.responsibleOk = true;
    }

    $w('#slider').value = 50;

    // === Save to Collection (envío definitivo) ===
    if (!item.staffSignature || ['Digital Signature', 'Download and Sign Physically'].includes($w('#responsibleSignatureOption').value)) {
        const downloadFile = ($w('#responsibleSignatureOption').value == 'Digital Signature') ? true : false;

        const applicationPDF = await generatePDF(formData, folderId, downloadFile);
        console.log('applicationPDF', applicationPDF)
        formData.pdf = applicationPDF;

        if ($w('#responsibleSignatureOption').value == 'Digital Signature') documents.push({ _id: String(docCounter++), name: `Application - ${item.title}`, url: applicationPDF });
    }

    documents.sort((a, b) => a.name.localeCompare(b.name));
    formData.documents = documents;
    formData.documentsString = await documentsString(documents);

    const catchFormInfo = {
        formName: item.title,
        baseUrl: wixLocationFrontend.baseUrl,
        staffSignature: item.staffSignature,
        _id: item._id,
        currentMemberInfo,
        autoSaveId,
        resultString,
        formData,
        memberId
    };

    $w('#slider').value = 75;

    createSubmission(catchFormInfo).then((thankYouState) => {
        $w('#slider').value = 100;
        $w('#formStages').changeState(thankYouState);
    });
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