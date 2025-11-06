import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true };

// ================================================================ CREATE
export const saveItem = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.insert(collectionId, json, wixDataOptions)
        .catch((err) => console.log(err))
});

// ================================================================ READ
export const generalQuery = webMethod(Permissions.Anyone, async (collectionId, fieldId, valueId) => {
    return await wixData.query(collectionId).eq(fieldId, valueId).find().then((results) => { return results.items })
        .catch((err) => console.log(err))
});

export const generalQuery_v2 = webMethod(Permissions.Anyone, async (collectionId, fieldId, valueId) => {
    return await wixData.query(collectionId).contains(fieldId, valueId).find().then((results) => { return results.items })
        .catch((err) => console.log(err))
});

export const getOneSessionPlans = webMethod(Permissions.Anyone, async (memberId) => {
    return await wixData.query("OneSessionPlan").eq("planId", "511f1abc-7853-4117-84f3-234a81ce9539").eq("memberId", memberId).eq("planCancelled", false).find().then((results) => { return results.items })
        .catch((err) => console.log(err))
});

export const getDropdownJobsOptions_Repeater_with_UniqueReference = webMethod(Permissions.Anyone, async (collectionId, collectionToSearch, field) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract series values
    const idReferences = allItems.map(item => item[field]);

    // Keep only unique values
    const uniqueReferences = [...new Set(idReferences)];

    // Fetch all unique items in parallel
    const itemsRepeater = await Promise.all(
        uniqueReferences.map(async (item) => {
            const result = await generalQuery(collectionToSearch, '_id', item);
            return result[0]; // assuming result is an array
        })
    );

    // Sort the results by title in ascending order
    itemsRepeater.sort((a, b) => a.title.localeCompare(b.title));

    return itemsRepeater;

});

// ================================================================ UPDATE
export const bulkUpdateWixData = webMethod(Permissions.Anyone, async (jsonToUpdate) => {
    return await wixData.bulkUpdate("OneSessionPlan", jsonToUpdate, wixDataOptions)
        .then(() => console.log("Cancel Plans"))
        .catch((err) => console.log(err))
});