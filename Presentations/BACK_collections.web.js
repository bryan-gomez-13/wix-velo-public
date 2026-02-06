import { Permissions, webMethod } from "wix-web-module";
import * as wixData from '@wix/data';

// ==================================================================== CREATE
// ==================================================================== READ
export const generalQuery = webMethod(Permissions.Anyone, async (collectionId, field, value) => {
    let results = await wixData.items.query(collectionId).eq(field, value).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const generalQuery2 = webMethod(Permissions.Anyone, async (collectionId, field1, value1, field2, value2) => {
    let results = await wixData.items.query(collectionId).eq(field1, value1).eq(field2, value2).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const getPasswordItem = webMethod(Permissions.Anyone, async (value) => {
    let results = await wixData.items.query('CustomPasswordPages').contains('page', value).eq('active', true).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})
// ==================================================================== UPDATE
// ==================================================================== DELETE