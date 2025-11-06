import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true };

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

// Options TxT
export const getDropdownJobsOptions_String = webMethod(Permissions.Anyone, async (collectionId, field) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all non-empty values from the specified field and remove duplicates
    const uniqueValues = [...new Set(allItems.map(item => item[field]).filter(Boolean))];

    // Create dropdown options with { label, value }
    const options = uniqueValues.map(value => ({
        label: value,
        value: value
    }));

    // Prepend the "All" option
    return [{ label: "All", value: "All" }, ...options];
});

export const getDropdownOptions_Array = webMethod(Permissions.Anyone, async (collectionId, field) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all values from the array field, flatten and remove duplicates
    const allValues = allItems
        .map(item => item[field])      // Get the array for each item
        .filter(Array.isArray)         // Ensure it's an array
        .flat()                        // Flatten to a single array
        .filter(Boolean);              // Remove null/undefined/empty

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

export const getDropdownJobsOptions_Repeater = webMethod(Permissions.Anyone, async (collectionId, field) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all values from the array field, flatten and remove duplicates
    const allValues = allItems
        .map(item => item[field])      // Get the array for each item
        .filter(Array.isArray)         // Ensure it's an array
        .flat()                        // Flatten to a single array
        .filter(Boolean);              // Remove null/undefined/empty

    const uniqueValues = [...new Set(allValues)];

    // Sort alphabetically
    const sortedValues = uniqueValues.sort((a, b) => a.localeCompare(b));

    // Format each value as { label, value, _id }
    const options = sortedValues.map(value => {
        const safeId = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        return {
            label: value,
            value: value,
            _id: safeId
        };
    });

    // Add "All" option at the beginning
    return [{ label: "All Posts", value: "All Posts", _id: "allPosts" }, ...options];
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
// ========================================================== UPDATE
// ========================================================== DELETE