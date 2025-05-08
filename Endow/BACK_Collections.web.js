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

        // **Send email only if NO discount is applied**
        await sendBeatByEmailForPurchase(beatInfo);

        // Check if the item already has an investor
        if (item.investor) {
            // Search history
            const results = await generalQuery('Payouts', 'memberId', item.investor);
            let investor = results[0];

            // Insert purchase information
            const jsonBuyer = {
                _id: `${orderInfo.orderNumber}`,
                beatName: itemPurchase.itemName,
                item: itemPurchase.descriptionLines[0].description,
                price: itemPurchase.totalPrice.value,
                paid: false
            };

            // Add the new buyer to the existing array or initialize it if it doesn't exist
            investor.buyers = [...(investor.buyers ?? []), jsonBuyer];

            // Save updates to the database
            await wixData.update('Payouts', investor, wixDataOptions);
            updateBeatHistory(investor);
            console.log("Order successfully saved!");
        }
    } catch (error) {
        console.error("Error saving order:", error);
    }
});

export const createPayment = webMethod(Permissions.Anyone, async (itemData, commission) => {
    const nextCommission = commission;
    const now = new Date();

    // Marcar todos los compradores como pagados
    itemData.buyers = (itemData.buyers || []).map(buyer => ({
        ...buyer,
        paid: true
    }));

    // Agregar nueva entrada al historial de pagos
    const newPaymentRecord = {
        _id: `${(itemData.paymentHistory?.length || 0) + 1}`,
        date: now.toDateString(),
        commission: nextCommission
    };

    itemData.paymentHistory = [...(itemData.paymentHistory || []), newPaymentRecord];

    // Actualizar flags de pago
    itemData.createPayment = false;
    itemData.paymentComplete = true;

    // Guardar cambios en la colección
    await updateCollection('Payouts', itemData);

    // Actualizar información del historial de beats
    await updateBeatHistory(itemData);
})

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

export const updateBeatHistory = webMethod(Permissions.Anyone, async (investorInfo) => {
    console.log("updateBeatHistory")
    const beats = await generalQuery('Beats', 'investor', investorInfo.memberId);
    const commissionRates = { "12": 0.20, "24": 0.25, "36": 0.30 };
    const buyers = investorInfo.buyers || [];

    const formatCurrency = (value) => {
        return value.toLocaleString("en-AU", {
            style: "currency",
            currency: "AUD",
            minimumFractionDigits: 2
        });
    };

    const formatDecimal = (value) => {
        return value.toFixed(2);
    };

    const beatMap = {};
    beats.forEach(beat => {
        const { title: beatName, month } = beat;
        const commissionRate = commissionRates[month] || 0;

        beatMap[beatName] = {
            beatName,
            month,
            commissionRate,
            BRONZE: { count: 0, total: 0, commission: 0 },
            SILVER: { count: 0, total: 0, commission: 0 },
            GOLD: { count: 0, total: 0, commission: 0 }
        };
    });

    let totalSales = 0;
    let totalCommissionEarned = 0;
    let nextCommissionPayment = 0;

    buyers.forEach(buyer => {
        const { beatName, item, price, paid } = buyer;
        const numericPrice = parseFloat(price);
        if (!["BRONZE", "SILVER", "GOLD"].includes(item)) return;

        if (!beatMap[beatName]) {
            beatMap[beatName] = {
                beatName,
                month: null,
                commissionRate: 0,
                BRONZE: { count: 0, total: 0, commission: 0 },
                SILVER: { count: 0, total: 0, commission: 0 },
                GOLD: { count: 0, total: 0, commission: 0 }
            };
        }

        const commissionRate = beatMap[beatName].commissionRate;
        const commission = numericPrice * commissionRate;

        beatMap[beatName][item].count += 1;
        beatMap[beatName][item].total += numericPrice;
        beatMap[beatName][item].commission += commission;

        totalSales += numericPrice;
        if (paid) {
            totalCommissionEarned += commission;
        } else {
            nextCommissionPayment += commission;
        }
    });

    function formatId(beatName) {
        return beatName
            .split(" ")
            .map((word, index) => {
                if (index === 0) return word.toLowerCase();
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    }

    const myBeatsInfo = Object.values(beatMap).map(beat => {
        return {
            _id: formatId(beat.beatName),
            beatName: beat.beatName,
            month: beat.month,
            commissionRate: beat.commissionRate,
            BRONZE: {
                count: formatDecimal(beat.BRONZE.count),
                total: formatCurrency(beat.BRONZE.total),
                commission: formatCurrency(beat.BRONZE.commission)
            },
            SILVER: {
                count: formatDecimal(beat.SILVER.count),
                total: formatCurrency(beat.SILVER.total),
                commission: formatCurrency(beat.SILVER.commission)
            },
            GOLD: {
                count: formatDecimal(beat.GOLD.count),
                total: formatCurrency(beat.GOLD.total),
                commission: formatCurrency(beat.GOLD.commission)
            }
        };
    });

    const paymentHistory = {
        myBeatsInfo,
        totalSales: formatCurrency(totalSales),
        totalCommissionEarned: formatCurrency(totalCommissionEarned),
        nextCommissionPayment: formatCurrency(nextCommissionPayment)
    }

    investorInfo.history = paymentHistory;
    investorInfo.totalSales = paymentHistory.totalSales;
    investorInfo.totalCommissionEarned = paymentHistory.totalCommissionEarned;
    investorInfo.nextCommissionPayment = paymentHistory.nextCommissionPayment;

    updateCollection('Payouts', investorInfo)

    return paymentHistory;
});

// ============================================ DELETE