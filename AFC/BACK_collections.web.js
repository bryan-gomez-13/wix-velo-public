import { Permissions, webMethod } from "wix-web-module";
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
    await wixData.update(collectionId, json, wixDataOptions)
});
// =========================================================================== DELETE
export const deleteItemFromCollection = webMethod(Permissions.Anyone, async (collectionId, itemId) => {
    await wixData.remove(collectionId, itemId)
        .then((result) => { console.log(result); })
        .catch((err) => { console.log(err); });
});