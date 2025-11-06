import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true };
// ========================================================== CREATE
export const bulkCreate = webMethod(Permissions.Anyone, async () => {
    const collection = await getCollection('Stores/Products');
    const items = collection.map(item => ({ title: item.name, productId: item._id, addToQuote: false }))
    wixData.bulkInsert('ProductsForAddToQuote', items, wixDataOptions)
})
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

export const getVariantFromOptions = webMethod(Permissions.Anyone, async (productId, options) => {
    const getVariants = await generalQuery('Stores/Variants', 'productId', productId);
    console.log(getVariants)

    const matchedVariant = getVariants.find(variant => {
        const choices = variant.choices;

        // Validar misma cantidad de claves
        const keys = Object.keys(options);
        if (keys.length !== Object.keys(choices).length) return false;

        // Comparar cada clave y valor
        return keys.every(key => choices[key] === options[key]);
    });

    return matchedVariant
})
// ========================================================== UPDATE
// ========================================================== DELETE