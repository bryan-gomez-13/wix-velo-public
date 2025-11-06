import { Permissions, webMethod } from "wix-web-module";
import { getContactInfo, generateFolderDownloadUrl } from 'backend/functions.web.js';
import { emailForms, emailSignRequired, emailPhysicalSignature, emailAdditionalInformationAdmin } from 'backend/email.web.js';
import wixData from 'wix-data';

const wixDataOptions = { "suppressAuth": true, "suppressHooks": true };
const baseUrl = 'https://registration.afcacademy.com/'
// =========================================================================== CREATE
export const insertCollection = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.insert(collectionId, json, wixDataOptions).then((result) => { return result._id })
});

export const bulkInsertCollection = webMethod(Permissions.Anyone, async (collectionId, jsonArray) => {
    return await wixData.bulkInsert(collectionId, jsonArray, wixDataOptions);
});

// ======= CREATE SUBMISSION
export const createSubmission = webMethod(Permissions.Anyone, async (catchFormInfo) => {
    // await insertCollection('Catch', { object: { catchFormInfo, formData } });
    // return 'thankYou'

    let baseUrl = catchFormInfo.baseUrl;
    let formData = catchFormInfo.formData;
    let staffSignature = catchFormInfo.staffSignature;
    let resultString = catchFormInfo.resultString;
    let autoSaveId = catchFormInfo.autoSaveId;
    let currentMemberInfo = catchFormInfo.currentMemberInfo;
    let _id = catchFormInfo._id;

    let itemCatchFormJson = {
        memberId: catchFormInfo.memberId,
        formName: catchFormInfo.formName,
        formJson: catchFormInfo,
        status: false,
        error: ''
    }

    let itemCatchFormToUpdate = await wixData.insert('CatchForm', itemCatchFormJson, wixDataOptions).then((result) => { return result });
    console.log(itemCatchFormToUpdate)
    // return 'thankYou';
    let thankYouState = '';

    try {
        await insertCollection('Formssubmitted', formData).then(async (itemCollectionId) => {

            const folderInfo = await generateFolderDownloadUrl(formData.folderId);
            await updateSubmissionInfo(itemCollectionId, folderInfo)

            if (!staffSignature || formData.responsibleSignatureOption == 'Digital Signature') {
                emailForms({
                    formName: catchFormInfo.formName,
                    name: formData.firstName,
                    data: resultString,
                    urlAdmin: `${baseUrl}/admin?formId=${itemCollectionId}`,
                    urlApplication: folderInfo
                });

                thankYouState = 'thankYou';
                itemCatchFormToUpdate.status = true;
            } else if (formData.responsibleSignatureOption == 'Email to director') {
                const urlWix = `${baseUrl}/signature?formId=${itemCollectionId}&signaturePass=${formData.passwordEmailSignature}`;
                emailSignRequired(formData, urlWix);
                thankYouState = 'thankYou2';
            } else if (formData.responsibleSignatureOption == 'Download and Sign Physically') {
                // ===================== Code for send pdf
                const applicationPDF = `${baseUrl}/signature?formId=${itemCollectionId}&signaturePass=${formData.passwordEmailSignature}`;
                emailPhysicalSignature(formData, applicationPDF, baseUrl);
                thankYouState = 'thankYou3';
            }

            if (autoSaveId) await deleteItemFromCollection('Formssubmitted', autoSaveId);

            // ================================================ UPDATE AND INSERT SUBMISSION INFO
            if (!Array.isArray(currentMemberInfo.forms)) {
                currentMemberInfo.forms = [];
            }

            currentMemberInfo.forms.push({
                _id: itemCollectionId,
                formId: _id,
                formName: catchFormInfo.formName,
                status: formData.status,
                date: new Date()
            });

            currentMemberInfo.formsString = JSON.stringify(currentMemberInfo.forms);

            // Prepare promises
            await updateCollection('Members', currentMemberInfo);
            itemCatchFormToUpdate.submissionId = itemCollectionId;

        });
    } catch (error) {
        itemCatchFormToUpdate.error = error;
        thankYouState = 'Error';
    }

    await updateCollection('CatchForm', itemCatchFormToUpdate);

    return thankYouState

})

export const updateSubmissionInfo = webMethod(Permissions.Anyone, async (itemCollectionId, folderInfo) => {
    await generalQuery('Formssubmitted', '_id', itemCollectionId).then(async (result) => {
        let item = result[0];
        item.folderDownloadUrl = folderInfo;

        await updateCollection('Formssubmitted', item)
    })
})

// =========================================================================== READ
export const getCollection = webMethod(Permissions.Anyone, async (collectionId) => {
    let results = await wixData.query(collectionId).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const generalQuery = webMethod(Permissions.Anyone, async (collectionId, field, value) => {
    let results = await wixData.query(collectionId).eq(field, value).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const generalQuery2 = webMethod(Permissions.Anyone, async (collectionId, field1, value1, field2, value2) => {
    let results = await wixData.query(collectionId).eq(field1, value1).eq(field2, value2).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

// Capitalizes the first letter of a word
export const getFormInfoAfterSave = webMethod(Permissions.Anyone, async (formId, memberId, type) => {
    return await wixData.query('Formssubmitted').eq('title', formId).eq('memberId', memberId).eq('autoSaveInfo', true).find().then(async (result) => {
        if (result.items.length > 0 && type == 'delete') {
            await wixData.remove('Formssubmitted', result.items[0]._id);
            return 'Ok';
        } else if (result.items.length > 0 && type == 'getInfo') {
            return result.items[0];
        } else {
            return false
        }
    })
})

export const getDropdownOptions = webMethod(Permissions.Anyone, async (collectionId, field) => {
    const collectionInfo = await getCollection(collectionId);
    if (!Array.isArray(collectionInfo)) return [];

    const uniqueValues = [...new Set(
        collectionInfo
        .map(item => item[field]) // Extrae el valor del campo
        .filter(value => value && typeof value === "string") // Filtra vacíos o no strings
    )];

    const result = uniqueValues
        .sort((a, b) => a.localeCompare(b)) // Orden alfabético
        .map(value => ({ label: value, value })); // Estructura final

    result.unshift({ label: "All", value: "All" }); // Agrega el "All" al inicio

    return result;

})

export const getDropdownOptionsWithId = webMethod(Permissions.Anyone, async (collectionId, field) => {
    const collectionInfo = await getCollection(collectionId);
    if (!Array.isArray(collectionInfo)) return [];

    // Extract unique values by field + id
    const uniqueValues = [];
    const seen = new Set();

    collectionInfo.forEach(item => {
        const fieldValue = item[field];
        const idValue = item._id;

        if (fieldValue && typeof fieldValue === "string" && !seen.has(fieldValue)) {
            seen.add(fieldValue);
            uniqueValues.push({ label: fieldValue, value: idValue });
        }
    });

    // Sort alphabetically by label
    const result = uniqueValues.sort((a, b) => a.label.localeCompare(b.label));

    return result;

})
// =========================================================================== UPDATE
export const updateCollection = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.update(collectionId, json, wixDataOptions)
});

export const updateCollectionAndSendSubmission = webMethod(Permissions.Anyone, async (formData) => {
    console.log('updateCollectionAndSendSubmission', formData)
    try {
        // 1. Generate folder URL and update submission info (secuencial, porque una depende de la otra)
        const folderInfo = await generateFolderDownloadUrl(formData.folderId);
        console.log('folderInfo', folderInfo)

        formData.folderDownloadUrl = folderInfo;
        await updateCollection('Formssubmitted', formData)

        // 2. Prepare email content (síncrono)
        const resultString = formData.emailMessage;

        // 3. Ejecutar en paralelo: enviar email + obtener CatchForm
        let [_, catchFormResult] = await Promise.all([
            emailForms({
                formName: formData.title,
                name: formData.firstName,
                data: resultString,
                urlAdmin: `${baseUrl}/admin?formId=${formData._id}`,
                urlApplication: formData.folderDownloadUrl
            }),
            generalQuery('CatchForm', 'submissionId', formData._id)
        ]);

        // 4. Update CatchForm status
        let catchFormSubmitted = catchFormResult[0];
        catchFormSubmitted.status = true;
        catchFormSubmitted.error = null;
        await updateCollection('CatchForm', catchFormSubmitted);

    } catch (error) {
        console.error("❌ Error processing submission:", error);

        // 5. Fallback: Intentar actualizar CatchForm con el error
        try {
            const catchFormResult = await generalQuery('CatchForm', 'submissionId', formData._id);
            const catchFormSubmitted = catchFormResult[0];
            if (catchFormSubmitted) {
                catchFormSubmitted.status = false;
                catchFormSubmitted.error = String(error?.message || error);
                await updateCollection('CatchForm', catchFormSubmitted);
            }
        } catch (innerError) {
            console.error("⚠️ Failed to update CatchForm with error info:", innerError);
        }
    }

});

export const updateCollectionAdditionalInfo = webMethod(Permissions.Anyone, async (formData) => {
    console.log('updateCollectionAndSendSubmission', formData)
    try {
        // 1. Generate folder URL and update submission info (secuencial, porque una depende de la otra)
        const folderInfo = await generateFolderDownloadUrl(formData.folderId);
        console.log('folderInfo', folderInfo)

        formData.folderDownloadUrl = folderInfo;
        await updateCollection('Formssubmitted', formData);

        const json = {
            userName: `${formData.firstName} ${formData.surname}`,
            email: formData.emailAddress,
            submission: formData._id,
            formName: formData.title,
            folderDownloadUrl : folderInfo
        }

        await emailAdditionalInformationAdmin(json);

    } catch (error) {
        console.error("❌ Error processing submission:", error);

        // 5. Fallback: Intentar actualizar CatchForm con el error
        try {
            const catchFormResult = await generalQuery('CatchForm', 'submissionId', formData._id);
            const catchFormSubmitted = catchFormResult[0];
            if (catchFormSubmitted) {
                catchFormSubmitted.status = false;
                catchFormSubmitted.error = String(error?.message || error);
                await updateCollection('CatchForm', catchFormSubmitted);
            }
        } catch (innerError) {
            console.error("⚠️ Failed to update CatchForm with error info:", innerError);
        }
    }

});

export const updateStatus = webMethod(Permissions.Anyone, async (json) => {
    let memberInfo = (await generalQuery('Members', 'memberId', json.memberId))[0];
    console.log(0, memberInfo)

    // update forms array
    memberInfo.forms = memberInfo.forms.map(item => {
        if (item._id === json._id) {
            return { ...item, status: json.status }; // ✅ updated
        }
        return item;
    });

    // update formsString
    memberInfo.formsString = JSON.stringify(memberInfo.forms);

    await updateCollection('Members', memberInfo);
});
// =========================================================================== DELETE
export const deleteItemFromCollection = webMethod(Permissions.Anyone, async (collectionId, itemId) => {
    return await wixData.remove(collectionId, itemId, wixDataOptions)
        .then((result) => { console.log(result); })
        .catch((err) => { console.log(err); });
});