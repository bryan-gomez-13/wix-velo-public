 import { getDropdownOptions, updateCollection, updateStatus, getDropdownOptionsWithId, insertCollection, bulkInsertCollection, deleteItemFromCollection } from 'backend/collections.web.js';
 import { emailAdditionalInformation } from 'backend/email.web.js';
 import wixLocationFrontend from "wix-location-frontend";
 import { currentMember } from "wix-members-frontend";
 import wixData from 'wix-data';

 var itemSubmissionInfo, adminInfo, infoSignatures, memberSubmissionInfo, memberInfoIdToSearch;

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
     $w('#subDate').onChange(() => filterSubmissions());
     $w('#subSortByDate').onChange(() => filterSubmissions());
     $w('#subClearFilter').onClick(() => {
         $w('#subSearch').value = '';
         $w('#subDropForms').value = '';
         $w('#subStatus').value = '';
         $w('#subDate').value = null;
         $w('#subSortByDate').value = '';

         filterSubmissions();
     });

     $w('#repSubmissions').onItemReady(($item, itemData) => {
         $item('#subName').text = `${itemData.firstName} ${itemData.surname}`;
         //  $item('#status').text = `Status: ${itemData.status}`;
         $item('#boxSubmissions').onClick(() => submissionInfo(itemData._id));
         $item('#brReadMore').onClick(() => submissionInfo(itemData._id));
     })

     // STATE SUBMISSIONS INFO
     getDropdownOptionsWithId("Form", 'title').then((memProgramOptions) => {
         $w('#memProgramApplication').options = memProgramOptions;
     })
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

         // Run both updates in parallel
         await Promise.all([
             updateStatus(dataSubmission),
             updateCollection('Formssubmitted', dataSubmission)
         ]);

         submissionInfo(dataSubmission._id);
         $w('#loadingSaveSubmission').hide()
         $w('#checkSubmission').show();
         $w('#btUpdateSubmissionInfo').show();

         $w('#dataFormSubmissions').refresh();

         setInterval(() => {
             $w('#checkSubmission').hide();
             $w('#statusSubmitted').enable();
         }, 5000);

     })

     $w('#checkApplication').onChange(() => {
         if ($w('#checkApplication').value == 'Open full application as PDF') {
             $w('#btApplicationPdf').expand();
             $w('#gHtml').collapse();
         } else {
             $w('#btApplicationPdf').collapse();
             $w('#gHtml').expand();
         }
     })

     // STATE SEND EMAIL
     $w('#seBtBack').onClick(() => $w('#adminStates').changeState('SubmissionInfo'));
     $w('#seBtSendEmail').onClick(() => sendEmailToGetAdditionalInfo());

     // STATE MEMBERS
     getDropdownOptions("Form", "title").then((formsOptions) => {
         $w('#mFormOptions').options = formsOptions;
     })

     $w('#mSearch').onInput(() => filterMembers());
     $w('#mRepMembers').onItemReady(($item, itemData) => {
         $item('#memName').text = `${itemData.firstName} ${itemData.surname}`;
         $item('#boxMember').onClick(() => memberInfo(itemData.memberId));
     })

     $w('#mFormOptions').onChange(() => filterMembers());
     $w('#mStatus').onChange(() => filterMembers());

     // STATE MEMBERS INFO
     $w('#mBack').onClick(() => $w('#adminStates').changeState('Members'));
     $w('#btSaveDocument').onClick(() => saveCertificate());
     $w('#memRepDocuments').onItemReady(($item, itemData) => {
         $item('#deleteCertificate').onClick(() => {
             deleteItemFromCollection('ACEProgrammedigitalcertificate', itemData._id).then(() => { refreshMemberDocuments(); })
         })
     })

     $w('#mBtMoreInfo').onClick((event) => {
         let $item = $w.at(event.context);
         const itemId = event.context.itemId;
         const itemData = $w('#mRepSubmissions').data.find(item => item._id == itemId)

         $w('#btMembers').enable();
         $w('#btSubmissions').disable();
         submissionInfo(itemData._id)
     });

     $w('#mBtRelease').onClick((event) => {
         let $item = $w.at(event.context);
         const itemId = event.context.itemId;
         const newHistoryForms = $w('#mRepSubmissions').data.filter(itemToRealease => itemToRealease._id !== itemId)

         memberSubmissionInfo.forms = newHistoryForms;
         memberSubmissionInfo.formsString = JSON.stringify(newHistoryForms);

         console.log(memberSubmissionInfo)

         updateCollection('Members', memberSubmissionInfo).then(() => {
             memberInfo(memberInfoIdToSearch);
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
     let sort;
     const search = $w('#subSearch').value;
     const subDate = $w('#subDate').value;
     const subSortByDate = $w('#subSortByDate').value;

     const form = $w('#subDropForms').value;
     const status = $w('#subStatus').value;

     if (search !== '') filter = filter.and(wixData.filter().contains('firstName', search).or(wixData.filter().contains('surname', search).or(wixData.filter().contains('emailAddress', search))));
     if (form !== '' && form !== 'All') filter = filter.and(wixData.filter().eq('title', form));
     if (status !== '' && status !== 'All') filter = filter.and(wixData.filter().eq('status', status));
     if (subDate !== '' && subDate !== null) filter = filter.and(wixData.filter().ge('_createdDate', subDate));
     if (subSortByDate !== '') {
         if (subSortByDate == 'Ascending') sort = wixData.sort().ascending('_createdDate');
         else sort = wixData.sort().descending('_createdDate');

     }

     $w('#dataFormSubmissions').setFilter(filter).then(() => {
         if (sort) $w('#dataFormSubmissions').setSort(sort);
         $w('#dataFormSubmissions').onReady(() => { $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions` });
     })
 }

 // ==================================================== STATE SUBMISSION INFO
 function submissionInfo(submissionId) {
     let filter = wixData.filter().eq('_id', submissionId);
     $w('#dataSubmissionItemInfo').setFilter(filter).then(() => {
         $w('#dataSubmissionItemInfo').onReady(() => {
             itemSubmissionInfo = $w('#dataSubmissionItemInfo').getCurrentItem();
             $w('#statusSubmitted').value = itemSubmissionInfo.status;
             if (itemSubmissionInfo.ai2CV) $w('#btCV').expand();
             else $w('#btCV').collapse();
         })
     });

     $w('#adminStates').changeState('SubmissionInfo');
     $w('#adminStates').scrollTo();
 }

 function changeStateSendEmail() {
     const item = $w('#dataSubmissionItemInfo').getCurrentItem();
     $w('#seSubject').value = `AFC additional information required - ${item.title}`;
     $w('#adminStates').changeState('SendEmail');
 }

 async function sendEmailToGetAdditionalInfo() {
     let item = $w('#dataSubmissionItemInfo').getCurrentItem();
     item.additionalInformation = true;

     await updateCollection('Formssubmitted', item);

     const json = {
         emailId: item.memberId,
         subject: $w('#seSubject').value,
         message: $w('#seMessage').value,
         email: item.emailAddress,
         form: item.title,
         formId: item._id
     }

     emailAdditionalInformation(json).then(() => {
         $w('#seSubject').value = '';
         $w('#seMessage').value = '';
         $w('#seSubject').resetValidityIndication();
         $w('#seMessage').resetValidityIndication();
         $w('#seMessageSendEmail').show();
         $w('#adminStates').changeState('SubmissionInfo');
         $w('#adminStates').scrollTo();
         setTimeout(() => $w('#seMessageSendEmail').hide(), 3000);
     })
 }

 // ==================================================== STATE MEMBERS
 function filterMembers() {
     let filter = wixData.filter();
     const search = $w('#mSearch').value;
     const memberFormFilter = $w('#mFormOptions').value;
     const memberStatusFilter = $w('#mStatus').value;

     if (search !== '') filter = filter.and(wixData.filter().contains('firstName', search).or(wixData.filter().contains('surname', search).or(wixData.filter().contains('emailAddress', search))));
     if (memberFormFilter !== '' && memberFormFilter !== null && memberFormFilter !== undefined && memberFormFilter !== 'All') {
         filter = filter.and(wixData.filter().contains('formsString', memberFormFilter))
     }

     if (memberStatusFilter !== '' && memberStatusFilter !== null && memberStatusFilter !== undefined && memberStatusFilter !== 'All') {
         filter = filter.and(wixData.filter().contains('formsString', memberStatusFilter))
     }

     $w('#dataMembers').setFilter(filter).then(() => {
         $w('#dataMembers').onReady(() => { $w('#totalMembers').text = `${$w('#dataMembers').getTotalCount()} Members` });
     })

 }
 // ==================================================== STATE MEMBERS INFO
 function memberInfo(memberId) {
     $w('#memFileName').value = '';
     $w('#memProgramApplication').value = '';
     $w('#uploadMemberDocument').reset();

     memberInfoIdToSearch = memberId;
     let filter = wixData.filter().eq('memberId', memberId);
     $w('#dataMembersInfo').setFilter(filter).then(() => {
         $w('#dataMembersInfo').onReady(() => {
             memberSubmissionInfo = $w('#dataMembersInfo').getCurrentItem();

             if (memberSubmissionInfo.forms) {
                 $w('#mRepSubmissions').data = memberSubmissionInfo.forms;

                 $w('#mRepSubmissions').onItemReady(($item, itemData) => {
                     $item('#mFormNameInfo').text = itemData.formName;
                     $item('#mStatusInfo').text = itemData.status;
                 })

                 $w('#mTitleFormSubmissions').expand();
                 $w('#mRepSubmissions').expand();
             } else {
                 $w('#mTitleFormSubmissions').collapse();
                 $w('#mRepSubmissions').collapse();
             }
         })
     })

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

             const formName = $w('#memProgramApplication').options[$w('#memProgramApplication').selectedIndex];

             const certificate = uploadedFiles.map((document) => ({
                 title: $w('#memFileName').value,
                 memberId: memberInfo.memberId,
                 document: document.fileUrl,
                 email: memberInfo.emailAddress,
                 formNameTitle: formName.value,
                 formName: $w('#memProgramApplication').value
             }));

             $w('#memFileName').value = '';
             $w('#memProgramApplication').value = '';
             $w('#uploadMemberDocument').reset();

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