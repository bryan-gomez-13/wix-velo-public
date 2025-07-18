import { Permissions, webMethod } from "wix-web-module";
import wixSecretsBackend from "wix-secrets-backend";
import { folders, files } from "wix-media.v2";
import { elevate } from "wix-auth";
import { getFileInfo, getFileInfo2 } from 'backend/functions.web.js';

const baseUrlAU = 'https://api-au.craftmypdf.com/';
const baseUrl = 'https://api.craftmypdf.com/';

export const generatePDF = webMethod(Permissions.Anyone, async (formData) => {
    const pdfData = await generateData(formData);
    console.log('pdfData', pdfData)
    const api_key = await wixSecretsBackend.getSecret("ApiKey");

    const json_payload = JSON.stringify({
        "data": pdfData,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": "83177b2395fc36b2"
    });

    const url = `${baseUrl}v1/create`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': api_key
            },
            body: json_payload
        });

        const json = await response.json();
        const fileReceived = json.file;

        // Esperar y retornar directamente
        const fileUrl = await uploadFile(fileReceived, formData);
        return fileUrl;

    } catch (err) {
        console.error('Error generating PDF:', err);
        throw new Error('PDF generation failed');
    }
});

export const generateData = webMethod(Permissions.Anyone, async (formData) => {
    const [image, sign1, sign2] = await Promise.all([
        getFileInfo2(formData.image),
        getFileInfo(formData.dSignatureFile),
        getFileInfo(formData.responsibleSignature)
    ]);

    const json = {
        "title": formData.title,
        "logoURL": "",
        //"logoURL": "https://static.wixstatic.com/media/b0568f_7ea339fd1c104b1db068a732c22f616d~mv2.png",

        "titlePersonalDetails": formData.titlePersonalDetails,
        "image": image,
        "firstName": formData.firstName,
        "surname": formData.surname,
        "nationality": formData.nationality,
        "dateOfBirth": formData.dateOfBirth,
        "passportNo": formData.passportNo,
        "gender": formData.gender,
        "emailAddress": formData.emailAddress,
        "mobileNumber": formData.mobileNumber,
        "addressLine": formData.addressLine,
        "city": formData.city,
        "postalCode": formData.postalCode,
        "country": formData.country,

        "titleRolesResponsibilities": formData.titleRolesResponsibilities,
        "currentPositionTitle": formData.currentPositionTitle,
        "department": formData.department,
        "divisionUnit": formData.divisionUnit,
        "dateJoined": formData.dateJoined,
        "typeOfEmployment": formData.typeOfEmployment,
        "ifContractValidityPeriod": formData.ifContractValidityPeriod,
        "currentRolesAndResponsabilitiesInfoTxT": formData.currentRolesAndResponsabilitiesInfoTxT,
        "rrProfessionalAchievementValidation": formData.rrProfessionalAchievementValidation,
        "professionalAchievementsTxT": formData.professionalAchievementsTxT,
        "rrPreviousPosition": formData.rrPreviousPosition,
        "rrPositionTitle": formData.rrPositionTitle,
        "rrDateJoinend": formData.rrDateJoinend,
        "rrRolesResponsabilities": formData.rrRolesResponsabilities,

        "titleDeclaration": formData.titleDeclaration,
        "applicantDeclaration": formData.dApplicantDeclaration,
        "dName": formData.dName,
        "dDesignation": formData.dDesignation,
        "dDate": formData.dDate,
        "dSignatureFile": sign1,

        "dResponsibleDeclaration": formData.dResponsibleDeclaration,
        "responsibleNameDeclaration": formData.responsibleNameDeclaration,
        "responsibleDateDeclaration": formData.responsibleDateDeclaration,
        "responsibleSignature": sign2,
    }

    return json
})

export const uploadFile = webMethod(Permissions.Anyone, async (url, formData) => {
    try {
        const options = {
            displayName: `${formData.passportNo} - ${formData.title}`,
            mimeType: "application/pdf",
            mediaType: "DOCUMENT",
            parentFolderId: "abbee8293db049bc9bf12c72b22d33ae"
        }

        const elevatedImportFile = elevate(files.importFile);
        const importedFile = await elevatedImportFile(url, options);
        
        return importedFile.file.url;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
});

export const myListFoldersFunction = webMethod(Permissions.Anyone, async () => {
    try {
        const elevatedListFolders = elevate(folders.listFolders);
        const folderList = await elevatedListFolders();

        console.log("Folders:", folderList);
        return folderList;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
});