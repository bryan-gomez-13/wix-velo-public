 import { generalQuery, updateCollectionAndSendSubmission } from 'backend/collections.web.js';
 import { uploadBase64Image, documentsString, getFileInfo2, updateDescriptionOfFile } from 'backend/functions.web.js';
 import wixLocationFrontend from "wix-location-frontend";
 import wixData from 'wix-data';
 import { generatePDF } from 'backend/apiIntegration.web.js';

 var itemSubmissionInfo, label, value, responsibleDeclaration;
 var itemsValidations = [
     '#responsibleNameDeclaration',
     '#responsibleSignatureFile',
     '#responsibleSignatureSign',
     '#responsibleStamp',
 ]

 var itemValidationPhysicalSignature = [
     '#uploadFile'
 ]

 $w.onReady(function () {
     init();
     if (wixLocationFrontend.query.formId) {
         if (wixLocationFrontend.query.adminPass) {
             label = 'passwordAdmin';
             value = wixLocationFrontend.query.adminPass;
         } else if (wixLocationFrontend.query.signaturePass) {
             label = 'passwordEmailSignature';
             value = wixLocationFrontend.query.signaturePass;
         }
         submissionInfo(wixLocationFrontend.query.formId, label, value)

     } else {
         wixLocationFrontend.to('/');
     }
 });

 // ==================================================== INIT
 function init() {
     // UPLOAD SIGNATURE
     $w('#btUpdateSubmissionInfo').onClick(async () => {
         $w('#btUpdateSubmissionInfo').hide();
         $w('#loadingSaveSubmission').show();

         try {
             const isValid = validation(itemsValidations);
             if (!isValid) {
                 throw new Error("Validation failed");
             }

             saveInfo();
         } catch (error) {
             console.log("Validation error:", error.message);
             // Optional: show a global error message if needed
             $w('#btUpdateSubmissionInfo').show();
             $w('#loadingSaveSubmission').hide();
         }
     })

     // UPLOAD PHYSICAL
     $w('#btUploadPhysicalFile').onClick(async () => {
         $w('#btUploadPhysicalFile').hide();
         $w('#loadingPhysicalFile').show();

         try {
             const isValid = validation(itemValidationPhysicalSignature);
             if (!isValid) {
                 throw new Error("Validation failed");
             }

             saveInfo();
         } catch (error) {
             console.log("Validation error:", error.message);
             // Optional: show a global error message if needed
             $w('#btUploadPhysicalFile').show();
             $w('#loadingPhysicalFile').hide();
         }
     })

     $w('#signatureType').onChange(() => {
         if ($w('#signatureType').value == 'Upload Signature') {
             $w('#responsibleSignatureFile').required = true;
             $w('#responsibleSignatureSign').required = false;

             $w('#responsibleSignatureFileError').hide();
             $w('#responsibleSignatureSignError').hide();

             $w('#responsibleSignatureFile').expand();
             $w('#responsibleSignatureSign').collapse();
         } else {
             $w('#responsibleSignatureFile').required = false;
             $w('#responsibleSignatureSign').required = true;

             $w('#responsibleSignatureFileError').hide();
             $w('#responsibleSignatureSignError').hide();

             $w('#responsibleSignatureFile').collapse();
             $w('#responsibleSignatureSign').expand();
         }
     })

     $w('#responsibleNameDeclaration').onInput(() => changeHtml());
 }

 async function saveInfo() {
     let dataSubmission = $w('#dataSubmissionItemInfo').getCurrentItem();
     let pdfUrl = "";

     if (dataSubmission.responsibleSignatureOption == 'Download and Sign Physically') {
         const pdf = await $w('#uploadFile').uploadFiles()
             .catch((uploadError) => console.log(uploadError));

         const json = {
             _id: pdf[0].fileName,
             parentFolderId: dataSubmission.folderId
         };

         await updateDescriptionOfFile(json);
         dataSubmission.pdf = pdf[0].fileUrl;
         pdfUrl = pdf[0].fileUrl;

     } else {
         dataSubmission.responsibleNameDeclaration = $w('#responsibleNameDeclaration').value;

         if ($w('#signatureType').value == 'Upload Signature') {
             if ($w('#responsibleSignatureFile').value.length > 0) {
                 const dSignatureFile = await $w('#responsibleSignatureFile').uploadFiles()
                     .catch((uploadError) => console.log(uploadError));
                 dataSubmission.responsibleSignature = dSignatureFile[0].fileUrl;
             }
         } else {
             const base64 = await uploadBase64Image($w('#responsibleSignatureSign').value, `Sign 2 ${dataSubmission.responsibleNameDeclaration}`);
             dataSubmission.responsibleSignature = base64;
         }

         const now = new Date();
         let formattedDate = now.toISOString().split('T')[0];
         dataSubmission.responsibleDateDeclaration = formattedDate;

         const stampFile = await $w('#responsibleStamp').uploadFiles().catch(console.log);
         if (stampFile?.length) {
             const fileInfo = await getFileInfo2(stampFile[0].fileUrl);
             dataSubmission.responsibleStamp = fileInfo;
         }

         // Create PDF
         const applicationPDF = await generatePDF(dataSubmission, dataSubmission.folderId, true);
         dataSubmission.pdf = applicationPDF;

         pdfUrl = applicationPDF;
     }

     dataSubmission.documents.push({
         _id: String((dataSubmission.documents.length + 1)),
         name: `Application - ${dataSubmission.title}`,
         url: pdfUrl
     });

     dataSubmission.responsibleOk = true;
     dataSubmission.status = 'Sent';

     // Sort documents alphabetically
     dataSubmission.documents.sort((a, b) => a.name.localeCompare(b.name));
     dataSubmission.documentsString = await documentsString(dataSubmission.documents)

     console.log(1, 'formData', dataSubmission)

     await updateCollectionAndSendSubmission(dataSubmission).then(async () => {
         $w('#loadingSaveSubmission').hide()
         $w('#checkSubmission').show();

         submissionInfo(dataSubmission._id, label, value);
         setInterval(() => $w('#checkSubmission').hide(), 2000);
     })

 }

 // ==================================================== STATE SUBMISSION INFO
 function submissionInfo(submissionId, label, value) {
     let filter = wixData.filter().eq('_id', submissionId).eq(label, value);
     $w('#dataSubmissionItemInfo').setFilter(filter).then(() => {
         $w('#dataSubmissionItemInfo').onReady(async () => {
             if ($w('#dataSubmissionItemInfo').getTotalCount() > 0) {
                 itemSubmissionInfo = $w('#dataSubmissionItemInfo').getCurrentItem();
                 console.log('itemSubmissionInfo', itemSubmissionInfo)

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

                 //  if (itemSubmissionInfo.responsibleOk && itemSubmissionInfo.responsibleOk == true) $w('#gDeclaration2').expand(), $w('#gDeclaration1').collapse(), $w('#btUpdateSubmissionInfo').collapse();
                 if (itemSubmissionInfo.responsibleOk && itemSubmissionInfo.responsibleOk == true) $w('#gDeclaration2').expand(), $w('#gDeclaration1').collapse(), $w('#btUpdateSubmissionInfo').collapse(), $w('#boxPhysicalDocument').collapse();
                 else if (itemSubmissionInfo.responsibleSignatureOption == 'Email to director') $w('#boxDeclaration').expand(), $w('#gDeclaration2').collapse(), $w('#boxPhysicalDocument').collapse(), $w('#gDeclaration1').expand(), $w('#btUpdateSubmissionInfo').expand();
                 else if (itemSubmissionInfo.responsibleSignatureOption == 'Download and Sign Physically') $w('#boxPhysicalDocument').expand(), $w('#boxDeclaration').collapse();

                 if (label == 'passwordAdmin') $w('#gDeclaration1').collapse(), $w('#btUpdateSubmissionInfo').collapse();

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

                     const link = (itemData.name.includes('Passport')) ? `https://static.wixstatic.com/media/${(itemData.url.split('/'))[3]}` : itemData.url;
                     $item('#documentLink').link = link;
                 })

                 responsibleDeclaration = (await generalQuery('Form', 'title', itemSubmissionInfo.title))[0].responsibleDeclaration;

                 changeHtml();

                 $w('#adminStates').changeState('SubmissionInfo');

             } else {
                 wixLocationFrontend.to('/');
             }
         })
     });
 }

 function validation(itemsValidationsID) {
     let isValid = true;

     itemsValidationsID.forEach(async (id) => {
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
             if (input.type === "$w.TextInput" || input.type === "$w.TextArea" || input.type === "$w.RichTextBox" || input.type === "$w.RadioButtonGroup") {
                 if (!input.value.trim()) {
                     errorMessage = "This field is required";
                 }
             } else if (input.type === "$w.UploadButton") {
                 if (input.value.length === 0) {
                     errorMessage = "Please upload your digital document";
                 }
             } else if (input.type === "$w.SignatureInput") {
                 if (input.value == '' || !input.value.includes('data:image')) {
                     errorMessage = "Please Sign the form";
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
         }
     });

     return isValid;
 }

 // CHANGE HTML RESPONSIBLE NAME
 function changeHtml() {
     const name = $w('#responsibleNameDeclaration').value.trim();

     // Replace placeholder {NAME} with the user's name underlined
     const updatedHtml = responsibleDeclaration.replace('{NAME}', name ? `<u>${name}</u>` : '<u>________</u>');

     // Set the new HTML to the element
     $w('#dResponsibleDeclaration').html = updatedHtml;
 }