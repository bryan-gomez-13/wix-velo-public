import { Permissions, webMethod } from "wix-web-module";
import { getDownloadUrl } from 'backend/Midoc/functions.web.js';
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
// ========================================================== UPDATE
export const updateDocument = webMethod(Permissions.Anyone, async (_id) => {
    const request = await generalQuery('ExpirationTimeDocuments', '_id', _id);
    let document = request[0]

    const date = new Date(document['_createdDate']);
    const expirationDate = new Date(date.getTime() + parseInt(document.timeMin) * 60000);
    const urlDownload = await getDownloadUrl(document['document'], document.timeMin);

    document.title = urlDownload.title;
    document.date = date;
    document.expirationDate = expirationDate;
    document.urlDownload = urlDownload.urlDownload;

    await updateItem('ExpirationTimeDocuments', document);

    return 'ok';
})

export const updateItem = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.update(collectionId, json, wixDataOptions)
})

// ========================================================== DELETE