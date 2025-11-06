import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';
import { mediaManager } from "wix-media-backend";

import { files } from 'wix-media.v2';
import { elevate } from 'wix-auth';

const wixDataOptions = { suppressAuth: true, suppressHooks: true }

export const getCategoryUrl = webMethod(Permissions.Anyone, async (collection, url) => {
    return await wixData.query(collection).contains("url", url).find().then((result) => { return result.items[0] })
});

export const getWixDataInfo = webMethod(Permissions.Anyone, async (collection, field, item) => {
    return await wixData.query(collection).eq(field, item).find().then((result) => { return result.items[0] })
});

export const getAllWixDataInfo = webMethod(Permissions.Anyone, async (collection, field, item) => {
    return await wixData.query(collection).eq(field, item).find().then((result) => { return result })
});

export const updateFAQ = webMethod(Permissions.Anyone, async (item, value) => {
    await wixData.query("Wasthisarticlehelpful").eq("faq", item._id).find().then(async (result) => {
        if (result.items.length > 0) {
            let item = result.items[0];
            if (value) item.yes++;
            else item.no++;
            await wixData.update("Wasthisarticlehelpful ", item, wixDataOptions)
                .catch((err) => console.log(err))
        } else {
            const json = {
                faq: item._id,
                yes: (value) ? 1 : 0,
                no: (value == false) ? 1 : 0,
                link: item.url
            }
            await wixData.insert("Wasthisarticlehelpful", json, wixDataOptions)
                .catch((err) => console.log(err))
        }
    }).catch((err) => console.log(err))
});
// ============================================ MEDIA

export const getFileInfo = webMethod(Permissions.Anyone, async (fileUrl) => {
    try {
        if (fileUrl.includes("wix:image")) {
            // Get file info
            const fileInfo = await mediaManager.getFileInfo(fileUrl);

            let searchOptions = {
                mediaTypes: ['IMAGE'],
                search: fileInfo.originalFileName
            };

            // Perform the search
            const elevatedSearchFiles = elevate(files.searchFiles);
            const searchFiles = await elevatedSearchFiles(searchOptions);

            // Filter files based on parentFolderId
            const filesFolder = searchFiles.files.filter(media => media.parentFolderId === fileInfo.parentFolderId);

            if (filesFolder.length === 0) {
                console.log("No files found in the folder.");
                return null;
            }

            // Search for the file in the JSON array
            const matchedFile = filesFolder.find(file =>
                Object.values(file).some(value =>
                    typeof value === "string" && value.includes(fileInfo.fileName)
                )
            );

            // Return the `url` field of the matched file or the first file in the folder
            return (matchedFile || filesFolder[0]).url;
        } else return fileUrl;
    } catch (error) {
        console.error(error);
        return null;
    }
});

// ====================================================================================================================================
// ========================================================== CREATE
// ========================================================== READ
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

export const getDropdownOptions_Array = webMethod(Permissions.Anyone, async (collectionId, field, category, categoryValue) => {
    // Fetch the initial batch of items
    let search = wixData.query(collectionId);
    if (category) search = search.eq(category, categoryValue)

    let results = await search.limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all values from the array field, flatten and remove duplicates
    const allValues = allItems
        .map(item => item[field]) // Get the array for each item
        .filter(Array.isArray) // Ensure it's an array
        .flat() // Flatten to a single array
        .filter(Boolean); // Remove null/undefined/empty

    const uniqueValues = [...new Set(allValues)];

    // Sort alphabetically
    const sortedValues = uniqueValues.sort((a, b) => a.localeCompare(b));

    // Format each value as { label, value }
    const options = sortedValues.map(value => ({
        label: value,
        value: value
    }));

    // Add "All" option at the beginning
    return [{ label: "All", value: "All" }, ...options];
});