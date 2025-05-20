import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

// ========================================================== CREATE
// ========================================================== READ
export const getDropdownJobsOptions = webMethod(Permissions.Anyone, async (collectionId, field) => {
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
        .map(item => item[field]) // Get the array for each item
        .filter(Array.isArray) // Ensure it's an array
        .flat() // Flatten to a single array
        .filter(Boolean); // Remove null/undefined/empty

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
// ========================================================== UPDATE
// ========================================================== DELETE