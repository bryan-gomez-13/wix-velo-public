 import { updateCollectionAdditionalInfo, deleteItemFromCollection } from 'backend/collections.web.js';
 import { updateDescriptionOfFile, documentsString } from 'backend/functions.web.js';
 import { currentMember } from "wix-members-frontend";
 import wixData from 'wix-data';
 import wixLocationFrontend from "wix-location-frontend";
 import wixWindowFrontend from "wix-window-frontend";

 let memberId = '';

 $w.onReady(function () {
     if (wixLocationFrontend.query.formId) {
         getMember().then(async () => {
             await submissionInfo(wixLocationFrontend.query.formId)
             filterSubmissions()
         })
         init();
     }
 });

 async function getMember() {
     return currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
             memberId = member._id;
             return memberId
         })
         .catch((error) => { console.error(error); });
 }

 // ==================================================== INIT
 function init() {
     // DATA
     $w('#dataFormSubmissions').onReady(() => $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions`);

     $w('#repSubmissions').onItemReady(($item, itemData) => {
         $item('#subName').text = `${itemData.firstName} ${itemData.surname}`;
         $item('#boxSubmissions').onClick(() => submissionInfo(itemData._id));
     })

     // STATE SUBMISSIONS INFO
     $w('#btSaveDocument').onClick(() => {
         wixWindowFrontend.openLightbox('ValidationAdditionalInformation').then((event) => {
             if (event.option == 'Yes') saveAdditionalInformation();
         })
     });
 }

 // ==================================================== STATE SUBMISSIONS
 function filterSubmissions() {
     let filter = wixData.filter().eq('memberId', memberId);

     $w('#dataFormSubmissions').setFilter(filter).then(() => {
         $w('#dataFormSubmissions').onReady(() => { $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions` });
     })
 }

 // ==================================================== STATE SUBMISSION INFO
 function submissionInfo(submissionId) {
     let filter = wixData.filter().eq('_id', submissionId);
     $w('#dataSubmissionItemInfo').setFilter(filter).then(() => {
         $w('#dataSubmissionItemInfo').onReady(() => {
             const item = $w('#dataSubmissionItemInfo').getCurrentItem();
             console.log('item', item);

             $w('#status').text = `Status: ${item.status}`
             if (item.additionalInformation) {
                 $w('#uploadMemberDocument').expand();
                 $w('#btSaveDocument').expand();

             } else {
                 $w('#uploadMemberDocument').collapse();
                 $w('#btSaveDocument').collapse();
             }

             if (item.sendEmailAdditionalInformation) {
                 $w('#adminStates').changeState('infoOk');
             }
         })
     });

     $w('#adminStates').changeState('SubmissionInfo');
 }

 async function saveAdditionalInformation() {
     $w('#btSaveDocument').disable();
     let formData = $w('#dataSubmissionItemInfo').getCurrentItem();
     let documents = formData.documents;
     let folderId = formData.folderId;
     let docCounter = formData.documents.length;

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

     const uploadAndCollect = async (selector) => {
         const files = await $w(selector).uploadFiles().catch(console.log);
         if (files?.length) {
             addFilesToDocuments(files);
         }
     };

     if ($w('#uploadMemberDocument').value.length) {
         await uploadAndCollect('#uploadMemberDocument');

         documents.sort((a, b) => a.name.localeCompare(b.name));
         formData.documents = documents;
         formData.documentsString = await documentsString(documents);

         console.log('formData', formData)

         await updateCollectionAdditionalInfo(formData).then(async () => {
             $w('#adminStates').changeState('infoOk2');
             $w('#adminStates').scrollTo();
         })
     }
 }