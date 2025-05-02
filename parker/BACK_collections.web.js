import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';
const wixDataOptions = { suppressAuth: true, suppressHooks: true, }

// ===================================================== CREATE =====================================================
export const inserEvents = webMethod(Permissions.Anyone, async (json) => {
    return await wixData.insert("Events", { array: json }, wixDataOptions)
});
// ===================================================== READ =====================================================
export const getAllCollection = webMethod(Permissions.Anyone, async (collectonId) => {
    let results = await wixData.query(collectonId).limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
});

export const generalQuery = webMethod(Permissions.Anyone, async (collectonId, fieldId, value) => {
    return await wixData.query(collectonId).eq(fieldId, value).find();
});

export const generalQuery_v2 = webMethod(Permissions.Anyone, async (collectonId, fieldId, value) => {
    let results = await wixData.query(collectonId).eq(fieldId, value).limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
});

export const generalQuery2 = webMethod(Permissions.Anyone, async (collectonId, fieldId1, value1, fieldId2, value2) => {
    return await wixData.query(collectonId).eq(fieldId1, value1).eq(fieldId2, value2).find()
});

export const generalQuery2_0 = webMethod(Permissions.Anyone, async (collectonId, fieldId1, value1, fieldId2, value2) => {
    return await wixData.query(collectonId).eq(fieldId1, value1).hasSome(fieldId2, value2).find()
});

export const updateFavorite = webMethod(Permissions.Anyone, async (collectonId, fieldId1, value1, fieldId2, value2, follow) => {
    const favoriteItem = await generalQuery2_0(collectonId, fieldId1, value1, fieldId2, value2)
    if (follow) {
        if (favoriteItem.items.length > 0) {
            await wixData.removeReference(collectonId, "favorite", favoriteItem.items[0]._id, value2, wixDataOptions)
                .then(() => { console.log("Reference removed") })
                .catch((error) => { console.log(error) });
            return true;
        } else {
            let itemToUpdate = await generalQuery(collectonId, fieldId1, value1);
            await wixData.insertReference(collectonId, "favorite", itemToUpdate.items[0]._id, value2, wixDataOptions)
                .then(() => { console.log("Reference inserted") })
                .catch((error) => { console.log(error) });
            return false;
        }
    } else {
        return favoriteItem;
    }
})

export const getLocations = webMethod(Permissions.Anyone, async () => {
    let results = await wixData.query("BoatsForSale2").limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Step 1: Extract unique locations
    const uniqueLocations = [...new Set(allItems.map(item => item.location))];

    // Step 2: Sort the locations alphabetically
    uniqueLocations.sort((a, b) => a.localeCompare(b));

    // Step 3: Create the new array of objects with { label, value } format
    const formattedLocations = uniqueLocations.map(location => ({
        label: location,
        value: location
    }));

    // Step 4: Add the "All" option at the beginning
    formattedLocations.unshift({ label: "All", value: "All" });

    // Final result
    console.log(formattedLocations);

    return formattedLocations;
});
// ===================================================== UPDATE =====================================================
export const updateCollection = webMethod(Permissions.Anyone, async (collectonId, json) => {
    return await wixData.update(collectonId, json, wixDataOptions)
        .then((result) => { return result })
});

export const updateDataMeta = webMethod(Permissions.Anyone, async () => {
    const collectionInfo = await getAllCollection('BoatsForSale2');
    
    let jsonBulkUpdate = []
    collectionInfo.forEach((item) => {
        item.metaDescription = item.boatDescription;
        jsonBulkUpdate.push(item)
    })

    wixData.bulkUpdate('BoatsForSale2', jsonBulkUpdate, wixDataOptions)

    return jsonBulkUpdate
});
// ===================================================== DELETE =====================================================