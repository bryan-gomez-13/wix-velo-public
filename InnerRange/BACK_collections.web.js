import { Permissions, webMethod } from "wix-web-module";
import { emailRSVPs } from "backend/emails.web.js";
import wixData from 'wix-data';

const wixDataOptions = { "suppressAuth": true, "suppressHooks": true };

// ==================================================================== CREATE
export const saveGuestRSVPs = webMethod(Permissions.Anyone, async (productInfo) => {
    const jsonToInsert = {
        firstName: productInfo.contact.name.first,
        email: productInfo.contact.email,
        eventName: productInfo.eventTitle,
        eventId: productInfo.eventId,
        eventDate: productInfo.eventDate,
        eventLocation: productInfo.eventLocation
    }

    wixData.insert("SaveRSVPs", jsonToInsert, wixDataOptions).then(() => {
        emailRSVPs(productInfo, jsonToInsert)
    }).catch((err) => console.log(err))
})
// ==================================================================== READ
export const getAllCollection = webMethod(Permissions.Anyone, async (collectionId) => {
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
        .map(item => item[field]) // Get the array for each item
        .filter(Array.isArray) // Ensure it's an array
        .flat() // Flatten to a single array
        .filter(Boolean); // Remove null/undefined/empty

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

export const getDropdownJobsOptions_Repeater = webMethod(Permissions.Anyone, async (collectionId, field, filterField, filterValue) => {
    // Fetch the initial batch of items
    let query = wixData.query(collectionId);
    if (filterValue !== '') query = query.eq(filterField, filterValue);

    let results = await query.limit(100).find();
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
    return options
    // return [{ label: "All", value: "All", _id: "all" }, ...options];
});

export const getChannelInfo = webMethod(Permissions.Anyone, async (collectionId, type, category, subCategory, search) => {
    // Fetch the initial batch of items
    let query = wixData.query(collectionId);

    // Apply category filter if present
    if (category !== '') {
        query = query.eq('category', category);
    }

    // Apply subCategory filter if present
    if (subCategory !== '') {
        query = query.eq('subCategory', subCategory);
    }

    // Apply search filter if present
    if (search !== '') {
        // Create a separate query for search in title or keywords
        const searchQuery = wixData.query(collectionId)
            .contains('title', search)
            .or(wixData.query(collectionId).contains('keywords', search));

        // Combine the search query with the main query
        query = query.and(searchQuery);
    }

    let results = await query.ascending(type).limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    return allItems
});

export const searchItems = webMethod(Permissions.Anyone, async (collectionId, fieldValue) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).contains('title', fieldValue).or(wixData.query(collectionId).contains('keywords', fieldValue)).or(wixData.query(collectionId).contains('category', fieldValue)).or(wixData.query(collectionId).contains('subCategory', fieldValue)).ascending('title').limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    return allItems
});

export const searchItems2 = webMethod(Permissions.Anyone, async (collectionId, fieldValue, category, subCategory) => {
    // Fetch the initial batch of items
    let results = await wixData.query(collectionId).contains('title', fieldValue).eq('category', category).eq('subCategory', subCategory).ascending('title').limit(100).find();
    let allItems = results.items;

    // Continue fetching the next pages if there are more results
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    return allItems
});

export const relatedProducts = webMethod(Permissions.Anyone, async (productId) => {
    return await wixData.queryReferenced("Products", productId, "relatedProducts")
        .then((results) => {
            if (results.items.length > 0) {
                return results.items.map((item) => item._id)
            } else return []
        }).catch((err) => { console.log(err) });
})

export const seoReport = webMethod(Permissions.Anyone, async () => {
    let results = await wixData.query("Products").ascending('name').limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Extract only certain fields
    let filteredItems = allItems.map(item => ({
        name: item.name,
        description: item.description,
        sku: item.sku,
        category: item.category,
        subCategory: item.subCategory,
        features: item.features
    }));

    console.log(filteredItems)

})
// ==================================================================== UPDATE
export const updateCollection = webMethod(Permissions.Anyone, async (collectionId, json) => {
    await wixData.update(collectionId, json, wixDataOptions);
})

export const updateImages = webMethod(Permissions.Anyone, async () => {
    return await wixData.query("Products").isEmpty("mediagallery").find().then(async (result) => {
        let items = result.items;
        console.log("items", items)
        let updateA = []
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            item.mediagallery = [{
                title: item.name,
                alt: item.name,
                src: item.image,
                description: "",
                type: "image"
            }]
            updateA.push(item)
        }
        console.log("updateA", updateA)
        await wixData.bulkUpdate("Products", updateA, wixDataOptions)
            .catch((err) => console.log(err))
        return "Ok"
    }).catch((err) => console.log(err))
});

export const updateDatasheets = webMethod(Permissions.Anyone, async () => {
    let results = await wixData.query('Downloads').contains('fileName', 'Datasheet').limit(100).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    // Create an array of promises to check if each item already exists
    const checks = allItems.map(item => {
        return generalQuery('ChannelMarketing', 'title', item.fileName)
            .then(request => ({ item, exists: request.length > 0 }));
    });

    // Wait for all checks to complete in parallel
    const resultsDocuments = await Promise.all(checks);

    // Filter out items that already exist
    const bulkInsert = resultsDocuments
        .filter(result => !result.exists)
        .map(result => ({
            title: result.item.fileName,
            category: ['Datasheet'],
            subCategory: ['Datasheet'],
            document: result.item.document
        }));

    // Perform the bulk insert only if there are new items
    if (bulkInsert.length > 0) {
        await wixData.bulkInsert('ChannelMarketing', bulkInsert, wixDataOptions);
    } else console.log('Nonas')

});

export const updateSEO = webMethod(Permissions.Anyone, async () => {
    let results = await wixData.query("Products").isNotEmpty('category').limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    let arrayToUpdate = [];
    allItems.forEach((items) => {
        const metaTitle = `${items.sku} | ${items.name} | ${items.category[0]}| Inner Range`;
        const altText = `${items.name} | ${items.sku}`;
        const tooltip = `${items.name} | ${items.sku}`;

        items.metaTitle = metaTitle;
        items.altText = altText;
        items.tooltip = tooltip;

        arrayToUpdate.push(items)
    })

    return arrayToUpdate

    wixData.bulkUpdate('Products', arrayToUpdate, wixDataOptions)
})
// ==================================================================== DELETE