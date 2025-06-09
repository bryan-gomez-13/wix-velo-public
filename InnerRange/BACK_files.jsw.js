import wixData from 'wix-data';
import { Permissions, webMethod } from 'wix-web-module';
import { files } from 'wix-media.v2';
import { elevate } from 'wix-auth';

var optionsWixData = { "suppressAuth": true, "suppressHooks": true };
// =============================================================== UPDATE DOWNLOADS COLLECTION
export async function getFilesAndUpdateDownloadCollection(sku, productId) {
    let folders = await wixData.query("Media/Folders").limit(1000).find();
    let allItems = folders.items;

    while (folders.hasNext()) {
        folders = await folders.next();
        allItems = allItems.concat(folders.items);
    }
    // Get Folder Info
    let folder = allItems.find((folder) => {
        let folderA = folder.folderName.split(' - ');
        if (folderA[0] == sku) return folder
    });

    if (folder) {
        // Get Files
        let filesByFolder = await listFilesByProduct(folder.folderId);
        console.log("filesByFolder", filesByFolder)
        // Create json to insert in collection
        let filesToInsertPromises = filesByFolder.map(async (fileToInsert) => {
            let splitS = "";
            
            if(fileToInsert.displayName.includes('.zip')) splitS = ".zip";
            else if(fileToInsert.displayName.includes('.pdf')) splitS = ".pdf";
            else if(fileToInsert.displayName.includes('.png')) splitS = ".png";
            else splitS = ".";

            let displayName = fileToInsert.displayName.split(splitS);
            let fileName = displayName[0];
            let metaTitle = displayName[0];
            let type = (displayName[0].includes('Firmware') || displayName[0].includes('Software')) ? ["Software - Firmware"] : ["Document"];

            let document = "";
            if (fileToInsert.media.archive) document = fileToInsert.url;
            else if (fileToInsert.media.image) document = fileToInsert.media.image.image;
            else if (fileToInsert.media.document) document = fileToInsert.media.document

            let url = await cleanString(displayName[0]);
            let json = {
                "fileName": fileName,
                "metaTitle": metaTitle,
                "type": type,
                "document": document,
                "url": url
            }
            return json;
        });

        let filesToInsert = await Promise.all(filesToInsertPromises);
        //console.log("filesToInsert", filesToInsert);
        await bulkDownloadCollectionInsert(filesToInsert, productId);

        return folder.folderName;
    } else {
        return false;
    }
}

export function cleanString(str) {
    let cleanedStr = str.replace(/[ &.]/g, '-').toLowerCase();
    return cleanedStr;
}

// =============================================================== GET FILES
export const listFilesByProduct = webMethod(Permissions.Anyone, async (parentFolderId) => {
    try {
        let folderID = parentFolderId;
        let listOptions = { parentFolderId: folderID }

        let elevatedListFiles = elevate(files.listFiles);
        let fileList = await elevatedListFiles(listOptions);
        let allItems = fileList.files;

        while (fileList.nextCursor.hasNext) {
            let listOptionsHastNext = {
                parentFolderId: folderID,
                paging: { cursor: fileList.nextCursor.cursors.next }
            }
            fileList = await elevatedListFiles(listOptionsHastNext);
            allItems = allItems.concat(fileList.files);
        }

        return allItems;
    } catch (error) { console.error(error); }
});

// =============================================================== WIX DATA
export async function getAllProducts() {
    try {
        const results = await wixData.query('Products').isEmpty('ok').limit(500).find();
        const items = results.items;

        // Save promises in folderInfo
        const promises = items.map(async (product) => {
            const folderInfo = await getFilesAndUpdateDownloadCollection(product.sku, product._id);
            if (folderInfo) {
                product.folderName = folderInfo;
                product.ok = true;
                return product;
            } else {
                product.folderName = "Pending";
                product.ok = false;
                return product;
            }
        });

        // get Filess and update product Collection
        const updatedProducts = await Promise.all(promises);
        const filteredProducts = updatedProducts.filter(product => product !== null);
        await bulkProductCollectionUpdate(filteredProducts);

        //return filteredProducts;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export async function bulkProductCollectionUpdate(bulkUpdate) {
    await wixData.bulkUpdate("Products", bulkUpdate, optionsWixData)
        .catch((err) => { console.log("bulkProductCollectionUpdate", err) });
}

export async function bulkDownloadCollectionInsert(bulkInsert, productId) {
    await wixData.bulkInsert("Downloads", bulkInsert, optionsWixData).then(async (results) => {
        await updateReference(results.insertedItemIds, productId)
    }).catch((err) => { console.log("bulkDownloadCollectionInsert", err) });
}

export async function updateReference(references, productId) {
    references.forEach(async (reference) => {
        await wixData.insertReference("Downloads", "products", reference, productId, optionsWixData) //.then(() => { console.log("Reference inserted") })
            .catch((error) => { console.log(error) });
    })
}

// =============================================================== 
export async function newProductsInCollection() {
    let folders = await wixData.query("Media/Folders").limit(1000).find();
    let allItems = folders.items;

    while (folders.hasNext()) {
        folders = await folders.next();
        allItems = allItems.concat(folders.items);
    }
    // Get Folder Info
    let foldersProduct = await allItems.filter((folder) => folder.folderName.includes(" - "));
    let bulkInsertProducts = [];

    for (let i = 0; i < foldersProduct.length; i++) {
        let folder = foldersProduct[i];
        let folderInfo = folder.folderName.split(' - ');
        let sku = folderInfo[0];
        let name = folderInfo[1];
        //console.log(sku)
        //bulkInsertProducts.push({ name, sku })
        await wixData.query('Products').eq('sku', sku).find().then((results) => {
            if (results.items.length === 0) {
                bulkInsertProducts.push({ name, sku })
            }
        }).catch((err) => console.log(err))
    }

    await wixData.bulkInsert("Products", bulkInsertProducts, optionsWixData)
        .catch((err) => { console.log("bulkDownloadCollectionInsert", err) });
}