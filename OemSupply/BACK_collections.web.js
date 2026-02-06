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

export const getCategory = webMethod(Permissions.Anyone, async () => {
    let results = await wixData.query('ProductsCatalog').ascending('order').ne("100Nett", "100 Nett").limit(1000).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all non-empty values from the specified field and remove duplicates
    const uniqueValues = [...new Set(allItems.map(item => item['category']).filter(Boolean))];

    // Create dropdown options with { label, value }
    const options = uniqueValues.map(value => ({
        label: value,
        value: value
    }));

    // Prepend the "All" option
    return [{ label: "All", value: "All" }, ...options];
})

export const getSubCategory = webMethod(Permissions.Anyone, async (category) => {
    let results = await wixData.query('ProductsCatalog').eq('category', category).ne("100Nett", "100 Nett").ascending('order').limit(1000).find()
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all non-empty values from the specified field and remove duplicates
    const uniqueValues = [...new Set(allItems.map(item => item['field0']).filter(Boolean))];

    // Create dropdown options with { label, value }
    const options = uniqueValues.map(value => ({
        label: value,
        value: value
    }));

    // Prepend the "All" option
    return [{ label: "All", value: "All" }, ...options];
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

// ========================================================== UPDATE
// ========================================================== DELETE