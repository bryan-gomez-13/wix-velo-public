import { Permissions, webMethod } from "wix-web-module";
import { sendBeatByEmailForPurchase } from 'backend/email.web.js';
import { getDownloadBeat } from 'backend/functions.web.js';
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true, };
// ============================================ CREATE
export const saveOrder = webMethod(Permissions.Anyone, async (orderInfo) => {
    try {
        console.log('Save Order', orderInfo);
        const itemPurchase = orderInfo.lineItems[0];

        // Execute the query asynchronously
        const results = await generalQuery('Beats', 'storeSong', itemPurchase.catalogItemId);
        if (results.length === 0) throw new Error("No beat found for the given catalogItemId");

        let item = results[0];

        // Get beat download URL
        const urlBeat = await getDownloadBeat(item.beatsLarge);
        const date = new Date().toDateString();
        const dateInvesmentValid = new Date();
        dateInvesmentValid.setFullYear(dateInvesmentValid.getFullYear() + 10);

        // Create beatInfo object for email
        const beatInfo = {
            orderUrl: `https://manage.wix.com/dashboard/18214615-1dc1-47f4-b3b6-0f07a56fde58/ecom-platform/order-details/${orderInfo._id}`,
            orderNumber: `Order ${orderInfo.orderNumber}`,
            beatName: `${itemPurchase.itemName} - ${itemPurchase.descriptionLines[0].description}`,
            licence: itemPurchase.descriptionLines[0].description,
            price: itemPurchase.totalPrice.value,
            contactId: orderInfo.contactId,
            contactName: `${orderInfo.contact.name.first} ${orderInfo.contact.name.last}`,
            contactEmail: orderInfo.contact.email,
            dateToPurchase: date,
            urlDownloadBeat: urlBeat
        };

        // Create investInfo object for email
        // const investInfo = {
        //     orderUrl: `https://manage.wix.com/dashboard/18214615-1dc1-47f4-b3b6-0f07a56fde58/ecom-platform/order-details/${orderInfo._id}`,
        //     orderLabel: `Order ${orderInfo.orderNumber}`,
        //     orderNumber: orderInfo.orderNumber,
        //     contactId: orderInfo.contactId,
        //     investorName: `${orderInfo.contact.name.first} ${orderInfo.contact.name.last}`,
        //     date: date,
        //     dateValidUntil: dateInvesmentValid.toDateString(),
        //     amount: itemPurchase.totalPrice.value
        // };

        // Check if the item already has an investor
        if (item.investor) {
            // Insert purchase information
            const jsonBuyer = {
                _id: `${orderInfo.orderNumber}`,
                orderNumber: `${orderInfo.orderNumber}`,
                beatName: itemPurchase.itemName,
                item: itemPurchase.descriptionLines[0].description,
                investorId: item.investor,
                price: itemPurchase.totalPrice.value
            };

            // Add the new buyer to the existing array or initialize it if it doesn't exist
            item.buyers = [...(item.buyers ?? []), jsonBuyer];
        }

        // Save updates to the database
        await wixData.update('Beats', item, wixDataOptions);
        console.log("Order successfully saved!");

        // **Send email only if NO discount is applied**
        await sendBeatByEmailForPurchase(beatInfo);

    } catch (error) {
        console.error("Error saving order:", error);
    }
});

export const createPayment = webMethod(Permissions.Anyone, async (investor) => {
    // Fetch investor purchases
    const items = await generalQuery2_1('Beats', 'investor', investor.memberId);
    const itemsCheck = items.map(({ month, buyers }) => ({ month, buyers }));

    // Process all purchases
    const allItems = await processPurchases(itemsCheck, investor.history);

    // Update investor summary
    investor.lastTotal = allItems.lastTotal;
    investor.lastComission = allItems.lastCommission;
    investor.lastPayment = new Date(); // Set last update time

    // Append new history entry
    investor.history = investor.history ? [...investor.history, allItems] : [allItems];
    investor.historyBackup = investor.history ? [...investor.history, allItems] : [allItems];

    // Finalize payment
    investor.createPayment = false;
    investor.paymentComplete = true;

    updateCollection('Payouts', investor);

    // Remove "buyers" key from each item
    const itemsToUpdate = items.map(({ buyers, ...rest }) => rest);

    // Update Wix Collection
    wixData.bulkUpdate("Beats", itemsToUpdate, wixDataOptions)
        .catch((err) => console.log(err))
})

function formatCurrency(value) {
    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        minimumFractionDigits: 2
    }).format(value);
}

function processPurchases(data, history = []) {
    const commissionRates = { "12": 0.20, "24": 0.25, "36": 0.30 };
    let totalSales = 0;
    let investorTotalCommission = 0;
    let beatSummary = {};
    let purchaseHistory = [];

    // Get current date for lastUpdate
    const lastUpdate = new Date().toISOString();

    data.forEach(({ month, buyers }) => {
        const commissionRate = commissionRates[month] || 0;

        buyers.forEach(({ orderNumber, price, beatName }) => {
            const priceNum = parseFloat(price);
            const commission = priceNum * commissionRate;

            // Add to total sales & investor commission
            totalSales += priceNum;
            investorTotalCommission += commission;

            // Track sales per beatName
            if (!beatSummary[beatName]) {
                beatSummary[beatName] = { totalSales: 0, investorCommission: 0 };
            }
            beatSummary[beatName].totalSales += priceNum;
            beatSummary[beatName].investorCommission += commission;

            // Store purchase history
            purchaseHistory.push({ orderNumber, beatName, price: formatCurrency(priceNum), investorCommission: formatCurrency(commission) });
        });
    });

    // Convert beatSummary to an array
    let beatSummaryArray = Object.keys(beatSummary).map(beatName => ({
        beatName,
        totalSales: formatCurrency(beatSummary[beatName].totalSales),
        investorCommission: formatCurrency(beatSummary[beatName].investorCommission)
    }));

    // Determine the next stage number
    let nextStage = `Stage${history.length + 1}`;

    // Final output objects (separated)
    return {
        _id: nextStage,
        lastTotal: formatCurrency(totalSales),
        lastCommission: formatCurrency(investorTotalCommission),
        lastUpdate,
        history: purchaseHistory,
        stage: nextStage,
        beatSummary: beatSummaryArray
    };
}

// ============================================ READ
export const generalQuery = webMethod(Permissions.Anyone, async (collectionId, fieldId, value) => {
    let results = await wixData.query(collectionId).eq(fieldId, value).limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const generalQuery2_1 = webMethod(Permissions.Anyone, async (collectionId, fieldId, value) => {
    let results = await wixData.query(collectionId).eq(fieldId, value).isNotEmpty('buyers').limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const getNotificationsEmails = webMethod(Permissions.Anyone, async () => {
    return await wixData.query("EmailNotifications").isNotEmpty("memberId").find().then((results) => { return results.items.map((item) => item.memberId) });
})

export const getReferences = webMethod(Permissions.Anyone, async (itemId) => {
    return await wixData.queryReferenced("Beats", itemId, "storeSongs").then((results) => {
        if (results.items.length > 0) {
            const items = results.items;
            items.sort((a, b) => a.price - b.price);
            return items;
        }
    }).catch((err) => { console.log(err); });
});
// ============================================ UPDATE
export const updateCollection = webMethod(Permissions.Anyone, async (collectionId, json) => {
    return await wixData.update(collectionId, json, wixDataOptions)
        .catch((err) => console.log(err))
})
// ============================================ DELETE