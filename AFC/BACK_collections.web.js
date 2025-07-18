import { Permissions, webMethod } from "wix-web-module";
import { getContactInfo } from 'backend/functions.web.js';
import wixData from 'wix-data';

const wixDataOptions = { "suppressAuth": true, "suppressHooks": true };
// =========================================================================== CREATE
export const insertCollection = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.insert(collectionId, json, wixDataOptions).then((result) => { return result._id })
});

export const bulkInsertCollection = webMethod(Permissions.Anyone, async (collectionId, jsonArray) => {
    return await wixData.bulkInsert(collectionId, jsonArray, wixDataOptions);
});

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
// =========================================================================== UPDATE
export const updateCollection = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.update(collectionId, json, wixDataOptions)
});
// =========================================================================== DELETE
export const deleteItemFromCollection = webMethod(Permissions.Anyone, async (collectionId, itemId) => {
    return await wixData.remove(collectionId, itemId, wixDataOptions)
        .then((result) => { console.log(result); })
        .catch((err) => { console.log(err); });
});