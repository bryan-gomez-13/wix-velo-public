 import { getDropdownOptions, updateCollection, insertCollection, bulkInsertCollection, deleteItemFromCollection } from 'backend/collections.web.js';
 import { emailAdditionalInformation } from 'backend/email.web.js';
 import wixLocationFrontend from "wix-location-frontend";
 import { currentMember } from "wix-members-frontend";
 import wixData from 'wix-data';

 var itemSubmissionInfo, adminInfo, infoSignatures;

 $w.onReady(function () {
     getMember();
     init();
 });

 // ==================================================== INIT
 function init() {
     // DATA
     getDropdownOptions('Form', 'title').then((options) => { $w('#subDropForms').options = options });
     $w('#dataFormSubmissions').onReady(() => $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions`);
     $w('#dataMembers').onReady(() => { $w('#totalMembers').text = `${$w('#dataMembers').getTotalCount()} Members` });

     // ADMIN
     $w('#btSubmissions').onClick(() => { $w('#btSubmissions').disable(), $w('#btMembers').enable(), $w('#adminStates').changeState('Submissions') });
     $w('#btMembers').onClick(() => { $w('#btMembers').disable(), $w('#btSubmissions').enable(), $w('#adminStates').changeState('Members') });

     // STATE SUBMISSIONS
     $w('#subSearch').onInput(() => filterSubmissions());
     $w('#subDropForms').onChange(() => filterSubmissions());
     $w('#subStatus').onChange(() => filterSubmissions());

     $w('#repSubmissions').onItemReady(($item, itemData) => {
         $item('#subName').text = `${itemData.firstName} ${itemData.surname}`;
         $item('#status').text = `Status: ${itemData.status}`;
         $item('#boxSubmissions').onClick(() => submissionInfo(itemData._id));
     })

     // STATE SUBMISSIONS INFO
     $w('#btBackSubmissionInfo').onClick(() => $w('#adminStates').changeState('Submissions'));
     $w('#dataSubmissionItemInfo').onAfterSave(() => $w('#dataFormSubmissions').refresh());
     $w('#btEmail').onClick(() => changeStateSendEmail());

     $w('#btUpdateSubmissionInfo').onClick(async () => {
         $w('#btUpdateSubmissionInfo').hide();
         $w('#loadingSaveSubmission').show();
         $w('#statusSubmitted').disable();
         let dataSubmission = $w('#dataSubmissionItemInfo').getCurrentItem();

         if ($w('#statusSubmitted').value !== '') dataSubmission.status = $w('#statusSubmitted').value;

         const now = new Date();
         const formatted = formatFullDate(now);

         let json = {
             adminId: adminInfo._id,
             adminName: `${adminInfo.contactDetails.firstName} ${adminInfo.contactDetails.lastName}`,
             adminEmail: adminInfo.loginEmail,
             date: formatted,
             status: $w('#statusSubmitted').value
         }

         if (!dataSubmission.history) dataSubmission.history = [json];
         else dataSubmission.history.push(json);

         await updateCollection('Formssubmitted', dataSubmission)

         submissionInfo(dataSubmission._id);
         $w('#loadingSaveSubmission').hide()
         $w('#checkSubmission').show();
         $w('#btUpdateSubmissionInfo').show();

         setInterval(() => {
             $w('#checkSubmission').hide();
             $w('#statusSubmitted').enable();
         }, 5000);

     })

     // STATE SEND EMAIL
     $w('#seBtBack').onClick(() => $w('#adminStates').changeState('SubmissionInfo'));
     $w('#seBtSendEmail').onClick(() => sendEmailToGetAdditionalInfo());

     // STATE MEMBERS
     $w('#mSearch').onInput(() => filterMembers());
     $w('#mRepMembers').onItemReady(($item, itemData) => {
         $item('#memName').text = `${itemData.firstName} ${itemData.surname}`;
         $item('#boxMember').onClick(() => memberInfo(itemData.memberId));
     })

     // STATE MEMBERS INFO
     $w('#mBack').onClick(() => $w('#adminStates').changeState('Members'));
     $w('#btSaveDocument').onClick(() => saveCertificate());
     $w('#memRepDocuments').onItemReady(($item, itemData) => {
         $item('#deleteCertificate').onClick(() => {
             deleteItemFromCollection('ACEProgrammedigitalcertificate', itemData._id).then(() => { refreshMemberDocuments(); })
         })
     })

     if (wixLocationFrontend.query.formId) submissionInfo(wixLocationFrontend.query.formId);
 }

 function getMember() {
     currentMember.getMember({ fieldsets: ['FULL'] })
         .then((member) => adminInfo = member)
         .catch((error) => { console.error(error); });
 }

 const formatFullDate = (date) => {
     const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
     const months = [
         "January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"
     ];

     const dayName = days[date.getDay()];
     const day = String(date.getDate()).padStart(2, '0');
     const monthName = months[date.getMonth()];
     const year = date.getFullYear();

     let hours = date.getHours();
     const minutes = String(date.getMinutes()).padStart(2, '0');
     const ampm = hours >= 12 ? 'PM' : 'AM';
     hours = hours % 12 || 12; // Convierte 0 a 12 y 13-23 a formato 1-11

     return `${dayName}, ${day} ${monthName} ${year} at ${hours}:${minutes} ${ampm}`;
 };

 // ==================================================== STATE SUBMISSIONS
 function filterSubmissions() {
     let filter = wixData.filter();
     const search = $w('#subSearch').value;
     const form = $w('#subDropForms').value;
     const status = $w('#subStatus').value;

     if (search !== '') filter = filter.and(wixData.filter().contains('firstName', search).or(wixData.filter().contains('surname', search).or(wixData.filter().contains('emailAddress', search))));
     if (form !== '' && form !== 'All') filter = filter.and(wixData.filter().eq('title', form));
     if (status !== '' && status !== 'All') filter = filter.and(wixData.filter().eq('status', status));

     $w('#dataFormSubmissions').setFilter(filter).then(() => {
         $w('#dataFormSubmissions').onReady(() => { $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions` });
     })
 }

 // ==================================================== STATE SUBMISSION INFO
 function submissionInfo(submissionId) {
     let filter = wixData.filter().eq('_id', submissionId);
     $w('#dataSubmissionItemInfo').setFilter(filter).then(() => {
         $w('#dataSubmissionItemInfo').onReady(() => {
             itemSubmissionInfo = $w('#dataSubmissionItemInfo').getCurrentItem();

             if (itemSubmissionInfo.additionalInformation) {
                 let filterAdditionalInformation = wixData.filter().eq('submission', itemSubmissionInfo._id);
                 $w('#dataAdditionalInformation').setFilter(filterAdditionalInformation).then(() => {
                     if ($w('#dataAdditionalInformation').getTotalCount() > 0) {
                         $w('#aiMessage').expand();
                         $w('#aiRep').expand();
                     } else {
                         $w('#aiMessage').collapse();
                         $w('#aiRep').collapse();
                     }
                 })
             } else {
                 $w('#aiMessage').collapse();
                 $w('#aiRep').collapse();
             }

             $w('#statusSubmitted').value = itemSubmissionInfo.status;

             if (itemSubmissionInfo.rolesResponsibilities) $w('#boxRoles').expand();
             else $w('#boxRoles').collapse();

             if (itemSubmissionInfo.workExperience) $w('#boxWorkExperience').expand();
             else $w('#boxWorkExperience').collapse();

             if (itemSubmissionInfo.academicProfessionalQualifications) $w('#boxAcademic').expand();
             else $w('#boxAcademic').collapse();

             if (itemSubmissionInfo.englishLanguageProficiency) $w('#boxEnglish').expand();
             else $w('#boxEnglish').collapse();

             if (itemSubmissionInfo.itProficiency) $w('#boxItProfiency').expand();
             else $w('#boxItProfiency').collapse();

             if (itemSubmissionInfo.responsibleOk && itemSubmissionInfo.responsibleOk == true && itemSubmissionInfo.applicantType !== 'Independent – Applicant & their organization') $w('#gDeclaration2').expand();
             else $w('#gDeclaration2').collapse();

             if (itemSubmissionInfo.rrPreviousPosition && itemSubmissionInfo.rrPreviousPosition == 'Applicable') $w('#gPreviousRoles').expand();
             else $w('#gPreviousRoles').collapse();

             if (itemSubmissionInfo.apqEnrolled && itemSubmissionInfo.apqEnrolled == 'Applicable') $w('#gAcademic').expand();
             else $w('#gAcademic').collapse();

             if (itemSubmissionInfo.elpInternationallyRecognised && itemSubmissionInfo.elpInternationallyRecognised == 'Yes') $w('#gEnglish').expand();
             else $w('#gEnglish').collapse();

             $w('#repDocuments').data = [];
             $w('#repDocuments').data = itemSubmissionInfo.documents;
             $w('#repDocuments').forEachItem(($item, itemData) => {
                 $item('#documentName').text = itemData.name;
                 $item('#documentLink').link = itemData.url;
             })
         })
     });

     $w('#adminStates').changeState('SubmissionInfo');
 }

 function changeStateSendEmail() {
     const item = $w('#dataSubmissionItemInfo').getCurrentItem();
     $w('#seSubject').value = `AFC additional information required - ${item.title}`;
     $w('#adminStates').changeState('SendEmail');
 }

 function sendEmailToGetAdditionalInfo() {
     let item = $w('#dataSubmissionItemInfo').getCurrentItem();
     item.additionalInformation = true;
     console.log('item', item)

     updateCollection('Formssubmitted', item);

     const json = {
         emailId: item.memberId,
         subject: $w('#seSubject').value,
         message: $w('#seMessage').value,
         email: item.emailAddress,
         form: item.title,
         formId: item._id
     }

     insertCollection('HystoryAdditionalInformationEmail', json);

     emailAdditionalInformation(json).then(() => {
         $w('#seSubject').value = '';
         $w('#seMessage').value = '';
         $w('#seSubject').resetValidityIndication();
         $w('#seMessage').resetValidityIndication();
         $w('#seMessageSendEmail').show();
         setTimeout(() => $w('#seMessageSendEmail').hide(), 3000);
     })
 }

 // ==================================================== STATE MEMBERS
 function filterMembers() {
     let filter = wixData.filter();
     const search = $w('#mSearch').value;

     if (search !== '') filter = filter.and(wixData.filter().contains('firstName', search).or(wixData.filter().contains('surname', search).or(wixData.filter().contains('emailAddress', search))));

     $w('#dataMembers').setFilter(filter).then(() => {
         $w('#dataMembers').onReady(() => { $w('#totalMembers').text = `${$w('#dataMembers').getTotalCount()} Members` });
     })

 }
 // ==================================================== STATE MEMBERS INFO
 function memberInfo(memberId) {
     let filter = wixData.filter().eq('memberId', memberId);
     $w('#dataMembersInfo').setFilter(filter);
     $w('#dataMemberDocuments').setFilter(filter).then(() => {
         $w('#dataMemberDocuments').onReady(() => {
             if ($w('#dataMemberDocuments').getTotalCount() > 0) $w('#memRepDocuments').expand(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
             else $w('#memRepDocuments').collapse(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
         })
     });
     $w('#adminStates').changeState('MembersInfo');
 }

 function saveCertificate() {
     const memberInfo = $w('#dataMembersInfo').getCurrentItem();

     $w("#uploadMemberDocument").uploadFiles().then((uploadedFiles) => {
             if (!uploadedFiles.length) throw new Error("No files uploaded.");

             const certificate = uploadedFiles.map((document) => ({
                 title: document.originalFileName,
                 memberId: memberInfo.memberId,
                 document: document.fileUrl,
                 email: memberInfo.emailAddress
             }));

             return bulkInsertCollection('ACEProgrammedigitalcertificate', certificate);
         }).then(() => { refreshMemberDocuments(); })
         .catch((error) => {
             console.error("Upload or insert failed:", error);
         });
 }

 function refreshMemberDocuments() {
     $w('#dataMemberDocuments').refresh().then(() => {
         $w('#uploadMemberDocument').reset();
         $w('#dataMemberDocuments').onReady(() => {
             if ($w('#dataMemberDocuments').getTotalCount() > 0) $w('#memRepDocuments').expand(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
             else $w('#memRepDocuments').collapse(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
         })
     })
 }