import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';
import { products } from "wix-stores.v2";
import { elevate } from "wix-auth";

import { sendBestBeforeEmail } from 'backend/email.web.js';

const wixDataOptions = { suppressAuth: true, suppressHooks: true }
// ====================================================================== CREATE
async function checkList2(results) {
    // const wholesalesProducts = await getAllCollectionsInfo('WholesalesProducts')
    // Filtramos los productos válidos
    const validResults = results.filter(item => {
        const desc = item?.additionalInfoSections?.[0]?.description || '';
        return desc !== '' && desc !== 'N/A' && desc !== 'N.A.';
    });

    // Procesamos en paralelo usando Promise.all
    const items = await Promise.all(validResults.map(async (item) => {
        let desc = item.additionalInfoSections.find(item => item.title == 'Best Before').description;
        let cleanedDesc = desc.replace('<p>', '').replace('</p>', '');
        let dateProduct = new Date(cleanedDesc).valueOf();
        let date = cleanedDesc;

        const dateNow = Date.now();
        const days = parseInt((dateProduct - dateNow) / (1000 * 60 * 60 * 24), 10);

        // let productWholesale = wholesalesProducts.find(itemWholesale => itemWholesale.sku == item.sku);
        // let nameWholesales = "";
        // let wholesalesPrice = "";
        let productId = item._id;

        // if (productWholesale) {
        //     nameWholesales = productWholesale.name;
        //     wholesalesPrice = await formatAsNZD(productWholesale.wholesalesPrice);
        // }

        return {
            retailName: item.name,
            sku: item.sku,
            date,
            days,
            inventory: item.quantityInStock,
            inStock: item.inStock,
            retailPrice: item.formattedPrice,
            weight: `${item.weight}`,
            // nameWholesales,
            // wholesalesPrice,
            productId
        };
    }));

    await wixData.bulkInsert("BestBefore", items, wixDataOptions);
}
// ====================================================================== READ
export const generalQuery = webMethod(Permissions.Anyone, async (collections, fieldId, value) => {
    return await wixData.query(collections).eq(fieldId, value).find();
})

export const getAllCollectionsInfo = webMethod(Permissions.Anyone, async (collectionId) => {
    let results = await wixData.query(collectionId).limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems
})

export const getProductCollectionsInfo = webMethod(Permissions.Anyone, async (collectionsInfo, productId) => {
    try {
        const elevateGetProduct = elevate(products.getProduct);
        const result = await elevateGetProduct(productId, { includeMerchantSpecificData: true });

        // Obtener nombres de las colecciones usando Promise.all y map
        const collections = await Promise.all(
            result.product.collectionIds.map(async (item) => {
                const collectionName = collectionsInfo.find(itemCollection => itemCollection._id == item)
                return { _id: item, collectionName: collectionName.name };
            })
        );

        return collections;
    } catch (error) {
        console.error(error);
    }
});

export const getCollections = webMethod(Permissions.Anyone, async () => {
    let results = await wixData.query("Stores/Collections").limit(50).ascending('name').find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Separate "All Products" item from others
    let allProductsItem = allItems.find(item => item.name === "All Products");
    let otherItems = allItems.filter(item => item.name !== "All Products");

    // Build final list with "All Products" first
    let formattedItems = [];

    if (allProductsItem) {
        formattedItems.push({ label: allProductsItem.name, value: allProductsItem.name });
    }

    formattedItems = formattedItems.concat(
        otherItems.map(item => ({ label: item.name, value: item.name }))
    );

    return formattedItems;
})

export const formatAsNZD = webMethod(Permissions.Anyone, async (amount) => {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
})

export const getBestBeforeToSendEmail = webMethod(Permissions.Anyone, async () => {
    const days = (await generalQuery('TriggerEmailBestbefore', '_id', 'fcfc8405-6459-4722-a260-a198ca52d9fa')).items[0].number;
    let results = await wixData.query('BestBefore').ge('days', 0).and(wixData.query('BestBefore').le('days', days)).limit(1000).ascending('days').find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    if (allItems.length > 0) {
        let formattedString = allItems.map(item => {
            // Remove the date line if it contains a line break
            let dateLine = item.date && !item.date.includes('\n') ? `Date: ${item.date}` : '';

            return [
                `Product: ${item.retailName}`,
                `Sku: ${item.sku}`,
                dateLine,
                `Days: ${item.days}`,
                `Inventory: ${item.inventory}`,
                '' // Line break between entries
            ].filter(Boolean).join('\n'); // Filter removes empty lines (like skipped date)
        }).join('\n\n'); // Double line break between each product

        sendBestBeforeEmail(formattedString, days)
    }
})

export const getBestBeforeEmailsNotifications = webMethod(Permissions.Anyone, async () => {
    return await wixData.queryReferenced("TriggerEmailBestbefore", "afcf8b0d-4610-4f36-8490-ca3fb537df58", "memberId").then((results) => {
        return results.items.map(item => item._id)
    }).catch((err) => { console.log(err); });
});

// ====================================================================== UPDATE
export const updateBestBeforeCollections = webMethod(Permissions.Anyone, async () => {
    let bestBeforeItems = await getAllCollectionsInfo('BestBefore');
    let collections = await getAllCollectionsInfo('Stores/Collections');

    bestBeforeItems = await Promise.all(
        bestBeforeItems.map(async (item) => {
            const category = await getProductCollectionsInfo(collections, item.productId);
            const categoryItem = category.map(category => category.collectionName).sort();
            const categoryString = categoryItem.join(', ');

            item.category = categoryItem;
            item.categoryString = categoryString;
            item.retail = category.some(c => c._id === '00000000-000000-000000-000000000001');
            // item.wholesales = category.some(c => c._id === '4ede0187-741f-4bc9-bab5-cb631049c4e7');
            // item.combo = category.some(c => c._id === '20469bb7-063e-4381-8781-9bb8ade091f4');
            item.clearance = category.some(c => c._id === '2f8b05b6-24b0-3fc9-69c3-860ab1d89036');
            // item.onSale = category.some(c => c._id === '313ae962-a3b6-4a45-bc33-e5dca3bfdb59');

            return item;
        })
    );

    await wixData.bulkUpdate("BestBefore", bestBeforeItems, wixDataOptions);
})
// ====================================================================== DELETE
// BEST BEFORE
export const getAllProductInformation = webMethod(Permissions.Anyone, async () => {
    return bulkRemove().then(async () => {
        let results = await wixData.query("Stores/Products").limit(100).find();
        let allItems = results.items;
        while (results.hasNext()) {
            results = await results.next();
            allItems = allItems.concat(results.items);
        }
        checkList2(allItems);
    })
})

export async function bulkRemove() {
    let results = await wixData.query("BestBefore").limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    let itemsId = allItems.map(item => item._id)
    await wixData.bulkRemove("BestBefore", itemsId, wixDataOptions);
}