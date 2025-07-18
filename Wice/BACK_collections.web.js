import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

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

export const getDropdownJobsOptions = webMethod(Permissions.Anyone, async (collectionId, field) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).ascending('order').limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract all non-empty values from the specified field and remove duplicates
    const uniqueValues = [...new Set(allItems.map(item => item[field]).filter(Boolean))];

    // Format each value as { label, value }
    return uniqueValues.map(value => ({
        label: value,
        value: value
    }));

})

export const getDropdownOptions = webMethod(Permissions.Anyone, async (collectionId) => {
    let results = await wixData.query(collectionId).ascending('order').limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
});

export const getHomeRepeater = webMethod(Permissions.Anyone, async () => {
    try {
        const items = await getCollection('Membersdirectory');
        const shuffled = shuffleArray(items);
        const randomSix = shuffled.slice(0, 6);
        return randomSix;

    } catch (err) {
        console.log("Error al cargar los datos:", err);
    }
})

function shuffleArray(array) {
    let currentIndex = array.length,
        randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

// ========================================================== UPDATE
// ========================================================== DELETE