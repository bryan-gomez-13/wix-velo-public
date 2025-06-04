 import { generalQuery, getDropdownOptions, updateCollection, insertCollection, bulkInsertCollection, deleteItemFromCollection } from 'backend/collections.web.js';
 import { emailAdditionalInformation } from 'backend/email.web.js';
 import wixData from 'wix-data';

 var itemSubmissionInfo;

 $w.onReady(function () {
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
         $item('#boxSubmissions').onClick(() => submissionInfo(itemData._id));
     })

     $w('#dataSubmissionItemInfo').onAfterSave(() => {
         generalQuery('Formssubmitted', '_id', itemSubmissionInfo._id).then((submittedInfo) => {
             let itemSubmission = submittedInfo[0];
             itemSubmission.responsibleOk = true;
             updateCollection('Formssubmitted', itemSubmission).then(() => {
                 submissionInfo(itemSubmission._id)
             })
         })
     })

     $w('#btResetSubmissionInfo').onClick(() => {
         generalQuery('Formssubmitted', '_id', itemSubmissionInfo._id).then((submittedInfo) => {
             let itemSubmission = submittedInfo[0];
             itemSubmission.responsibleOk = false;
             itemSubmission.responsibleNameDeclaration = undefined;

             updateCollection('Formssubmitted', itemSubmission).then(() => {
                 submissionInfo(itemSubmission._id)
             })
         })
     })

     // STATE SUBMISSIONS INFO
     $w('#btBackSubmissionInfo').onClick(() => $w('#adminStates').changeState('Submissions'));
     $w('#dataSubmissionItemInfo').onAfterSave(() => $w('#dataFormSubmissions').refresh());
     $w('#btEmail').onClick(() => changeStateSendEmail());

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
 }

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

             if (itemSubmissionInfo.responsibleOk && itemSubmissionInfo.responsibleOk == true) $w('#gDeclaration2').expand(), $w('#gDeclaration1').collapse();
             else $w('#gDeclaration2').collapse(), $w('#gDeclaration1').expand();

             if (itemSubmissionInfo.rrPreviousPosition && itemSubmissionInfo.rrPreviousPosition == 'Applicable') $w('#gPreviousRoles').expand();
             else $w('#gPreviousRoles').collapse();

             if (itemSubmissionInfo.apqEnrolled && itemSubmissionInfo.apqEnrolled == 'Applicable') $w('#gAcademic').expand();
             else $w('#gAcademic').collapse();

             if (itemSubmissionInfo.elpInternationallyRecognised && itemSubmissionInfo.elpInternationallyRecognised == 'Yes') $w('#gEnglish').expand();
             else $w('#gEnglish').collapse();

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

         updateCollection('Formssubmitted', item)
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