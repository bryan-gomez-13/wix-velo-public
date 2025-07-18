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

export const searchPage = webMethod(Permissions.Anyone, async (result) => {
    const value = parseInt(result);

    return await wixData.query('EnergyScanResults')
        .ge('maxResult', value)
        .le('minResult', value)
        .find()
        .then((result) => {
            if (result.items.length > 0) return result.items[0].url
        })
})

export const getAllQuestions = webMethod(Permissions.Anyone, async () => {
    const collectionInfo = await getCollection('PITSTOPPOWEREnergyScan');

    const result = [];

    const grouped = collectionInfo.reduce((acc, item) => {
        if (!acc[item.title]) {
            acc[item.title] = {
                order: item.order,
                title: `${item.order}. ${item.title}`,
                options: []
            };
        }

        acc[item.title].options.push({
            label: item.option,
            value: item.value,
            orderOptions: item.orderOptions
        });

        return acc;
    }, {});

    // Convert grouped object into array and sort options by orderOptions
    for (const key in grouped) {
        const item = grouped[key];

        item.options.sort((a, b) => a.orderOptions - b.orderOptions);

        // Add _id as same as label and remove orderOptions
        item.options = item.options.map(({ label, value }) => ({
            label,
            value,
            _id: value.toString()
        }));

        result.push(item);
    }

    // Sort final array by order number just in case
    result.sort((a, b) => a.order - b.order);

    return result;
})
// ========================================================== UPDATE
// ========================================================== DELETE