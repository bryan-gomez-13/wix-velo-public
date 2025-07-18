 import { generalQuery, updateCollection } from 'backend/collections.web.js';
 import { uploadBase64Image } from 'backend/functions.web.js';
 import wixLocationFrontend from "wix-location-frontend";
 import { emailForms } from 'backend/email.web.js';
 import wixData from 'wix-data';
 import { generatePDF } from 'backend/apiIntegration.web.js';

 var itemSubmissionInfo, label, value, responsibleDeclaration;
 var itemsValidations = [
     '#responsibleNameDeclaration',
     '#responsibleSignatureFile',
     '#responsibleSignatureSign',
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
         if ($w('#signatureType').value == 'Digital signature') {
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

     if (dataSubmission.responsibleSignatureOption == 'Physical Signature') {
         const pdf = await $w('#uploadFile').uploadFiles()
             .catch((uploadError) => console.log(uploadError));
         dataSubmission.pdf = pdf[0].fileUrl;

         dataSubmission.documents.forEach(item => {
             if (item.name.includes("Application -")) {
                 item.url = pdf[0].fileUrl;
             }
         });
     } else {
         dataSubmission.responsibleNameDeclaration = $w('#responsibleNameDeclaration').value;

         if ($w('#signatureType').value == 'Digital signature') {
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

         // Create PDF
         const applicationPDF = await generatePDF(dataSubmission);
         dataSubmission.pdf = applicationPDF;

         dataSubmission.documents.push({
             _id: String((dataSubmission.documents.length + 1)),
             name: `Application - ${dataSubmission.title}`,
             url: applicationPDF
         });

         // Sort documents alphabetically
         dataSubmission.documents.sort((a, b) => a.name.localeCompare(b.name));
     }

     dataSubmission.responsibleOk = true;
     dataSubmission.status = 'Sent';

     console.log(1, 'formData', dataSubmission)

     await updateCollection('Formssubmitted', dataSubmission)

     $w('#loadingSaveSubmission').hide()
     $w('#checkSubmission').show();

     setInterval(() => $w('#checkSubmission').hide(), 5000);

     submissionInfo(dataSubmission._id, label, value);

     emailForms({
         formName: dataSubmission.title,
         name: dataSubmission.firstName,
         data: dataSubmission.emailMessage,
         urlAdmin: `${wixLocationFrontend.baseUrl}/admin?formId=${dataSubmission._id}`,
         urlApplication: `${wixLocationFrontend.baseUrl}/signature?formId=${dataSubmission._id}&adminPass=${dataSubmission.passwordAdmin}`,
     });
 }

 // ==================================================== STATE SUBMISSION INFO
 function submissionInfo(submissionId, label, value) {
     let filter = wixData.filter().eq('_id', submissionId).eq(label, value);
     $w('#dataSubmissionItemInfo').setFilter(filter).then(() => {
         $w('#dataSubmissionItemInfo').onReady(async () => {
             if ($w('#dataSubmissionItemInfo').getTotalCount() > 0) {
                 itemSubmissionInfo = $w('#dataSubmissionItemInfo').getCurrentItem();
                 console.log(itemSubmissionInfo)

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

                 //  if (itemSubmissionInfo.responsibleOk && itemSubmissionInfo.responsibleOk == true) $w('#gDeclaration2').expand(), $w('#gDeclaration1').collapse(), $w('#btUpdateSubmissionInfo').collapse();
                 if (itemSubmissionInfo.responsibleOk && itemSubmissionInfo.responsibleOk == true) $w('#gDeclaration2').expand(), $w('#gDeclaration1').collapse(), $w('#btUpdateSubmissionInfo').collapse(), $w('#boxPhysicalDocument').collapse();
                 else if (itemSubmissionInfo.responsibleSignatureOption == 'Email to director') $w('#boxDeclaration').expand(), $w('#gDeclaration2').collapse(), $w('#boxPhysicalDocument').collapse(), $w('#gDeclaration1').expand(), $w('#btUpdateSubmissionInfo').expand();
                 else if (itemSubmissionInfo.responsibleSignatureOption == 'Physical Signature') $w('#boxPhysicalDocument').expand();

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
                     $item('#documentLink').link = itemData.url;
                 })

                 responsibleDeclaration = (await generalQuery('Form', 'title', itemSubmissionInfo.title))[0].responsibleDeclaration;
                 console.log(responsibleDeclaration)

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