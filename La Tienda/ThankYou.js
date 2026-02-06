import { getOrderInfo } from 'backend/functions.web.js';
import { generalQuery, generalQuery2, generalInsertData } from 'backend/collections.web.js';
import { getTerminals } from 'backend/unisendApiIntegration.web.js';
import { updateOrder } from 'backend/functions.web.js';
import { local } from "wix-storage-frontend";

let terminals, lockerItem, orderNumber, orderId;

$w.onReady(function () {
    getInfo();
    init();
});

function getInfo() {
    $w("#thankYouPage1").getOrder().then((order) => {
        getOrderInfo(order._id).then(async (retrievedOrder) => {
            console.log(retrievedOrder)
            orderNumber = retrievedOrder.number;
            orderId = retrievedOrder._id;
            // Variables
            const country = retrievedOrder.shippingInfo.logistics.shippingDestination.address.country;
            // const checkParcelLocker = retrievedOrder.shippingInfo.title.toLowerCase().includes('Parcerl Locker'.toLowerCase());
            const checkParcelLocker = retrievedOrder.shippingInfo.title.toLowerCase().includes('Parcel Locker'.toLowerCase());

            // SmartPost
            const smartPost = retrievedOrder.shippingInfo.title.toLowerCase().includes('smartpost');
            if (smartPost) $w('#secThankYou').expand();

            // UnPaid
            if (retrievedOrder.paymentStatus == 'NOT_PAID') {
                const url = `https://wise.com/pay/business/latiendaou?amount=${order.totals.total}&currency=${order.currency}`;
                $w('#payByWise').link = url;
                $w('#boxPurchase').expand();
            } else {
                $w('#boxPurchase').collapse();
            }

            // Unisend
            const itemsInfo = await generalQuery('LockerInfo', 'order', parseInt(orderNumber));
            if (itemsInfo.items.length == 0) {
                // =================== UNISEND
                generalQuery2('Velo', '_id', 'ac292a23-9e7c-4e75-bf9d-fa7706c93ba2').then((result) => {
                    const item = result[0];
                    if (item.activeCode) {
                        // Unisend
                        if (country !== 'Other' && checkParcelLocker) {
                            getTerminals(country).then((requestTerminals) => {
                                // Terminal list
                                terminals = requestTerminals;

                                // Extract unique cities
                                const uniqueCities = [...new Set(requestTerminals.map(item => item.city))]
                                    .sort((a, b) => a.localeCompare(b))
                                    .map(city => ({ label: city, value: city }));

                                $w('#city').options = uniqueCities;
                                $w('#city').value = '';
                                $w('#secLocker').expand();
                                $w('#txtWait').collapse();
                                $w('#imageX2').collapse();
                                $w('#secThankYouInfo').expand();

                                if (local.getItem('locker')) {
                                    lockerItem = JSON.parse(local.getItem('locker'));
                                    console.log(lockerItem)
                                    $w('#locker').value = `${lockerItem.name}, ${lockerItem.address}`;
                                    $w('#locker').disable();
                                    $w('#boxRepLockers').collapse();

                                    $w('#city').value = lockerItem.city;
                                    const city = lockerItem.city;
                                    const newTerminalList = terminals.filter(item => item.city == city);

                                    repLockers(newTerminalList)

                                    $w('#boxCity').expand();
                                    $w('#lockerMap').location = {
                                        latitude: parseFloat(lockerItem.latitude),
                                        longitude: parseFloat(lockerItem.longitude),
                                        description: `Name: ${lockerItem.name}\nAddress: ${lockerItem.address}\nServicing Hours: ${lockerItem.servicingHours}\nPostal Code: ${lockerItem.postalCode}`,
                                    }

                                    setTimeout(() => {
                                        $w('#lockerMap').expand();
                                    }, 500);

                                    $w('#boxLocker').expand();
                                }
                            })
                        } else {
                            $w('#secLocker').collapse();
                        }
                    } else {
                        $w('#txtWait').collapse();
                        $w('#imageX2').collapse();
                        $w('#secThankYouInfo').expand();
                    }
                })
            } else {
                $w('#txtWait').collapse();
                $w('#imageX2').collapse();
                $w('#secThankYouInfo').expand();
            }
        })
    }).catch((error) => { console.log(error); });
}

function init() {
    // City
    $w('#city').onChange(() => {
        $w('#boxLocker').collapse();
        $w('#lockerMap').collapse();

        const city = $w('#city').value;
        const newTerminalList = terminals.filter(item => item.city == city);

        repLockers(newTerminalList)
    })

    // Locker Item
    $w('#locker').onInput(() => { filterByClickOrInput() })

    $w('#boxRepName').onClick((event) => {
        $w('#boxRepLockers').collapse();
        $w('#locker').disable();
        const itemId = event.context.itemId;
        const itemData = $w('#repLockers').data.find(item => item._id == itemId);
        console.log(itemData)

        lockerItem = itemData;
        $w('#locker').value = `${itemData.name}, ${itemData.address}`;
        filterByClickOrInput();

        $w('#lockerMap').location = {
            latitude: parseFloat(itemData.latitude),
            longitude: parseFloat(itemData.longitude),
            description: `Name: ${itemData.name}\nAddress: ${itemData.address}\nServicing Hours: ${itemData.servicingHours}`,
        }

        setTimeout(() => {
            $w('#lockerMap').expand();
        }, 500);
    })

    $w('#okLocker').onClick(async () => {
        const localItemString = lockerItem;
        const jsonToInsert = {
            order: parseInt(orderNumber),
            lockerInfo: localItemString,
            lockerInfoTxT: `Country: ${localItemString.countryCode}\nCity: ${localItemString.city}\nAddress: ${localItemString.address}\nName: ${localItemString.name}`,
            orderId
        }

        const jsonToUpdateOrder = {
            shippingInfo: {
                logistics: {
                    shippingDestination: {
                        address: {
                            addressLine1: localItemString.address,
                            city: localItemString.city,
                            country: localItemString.countryCode,
                            postalCode: localItemString.postalCode
                        }
                    }
                }
            }
        }

        await Promise.all([
            updateOrder(orderId, jsonToUpdateOrder),
            generalInsertData('LockerInfo', jsonToInsert)
        ]);

        $w('#boxCity').collapse();
        $w('#secLocker').collapse();
    })

    $w('#deleteLocker').onClick(() => {
        $w('#locker').value = '';
        $w('#locker').enable();
        if ($w('#city').value) $w('#boxLocker').expand();
        if ($w('#city').collapsed) $w('#boxCity').expand();
        $w('#boxRepLockers').expand();
        filterByClickOrInput();
    })
}

function filterByClickOrInput() {
    const searchValue = $w('#locker').value.toLowerCase(); // Convert input to lowercase
    const newTerminalList = terminals.filter(item => item.address.toLowerCase().includes(searchValue) || item.name.toLowerCase().includes(searchValue) || `${item.name}, ${item.address}` === searchValue);
    repLockers(newTerminalList)
}

function repLockers(newTerminalList) {
    newTerminalList.sort((a, b) =>
        a.address.toLowerCase().localeCompare(b.address.toLowerCase())
    );

    console.log(newTerminalList)

    $w('#repLockers').data = newTerminalList;
    $w('#repLockers').onItemReady(($item, itemData) => {
        $item('#lockerName').text = `${itemData.name}, ${itemData.address}`;
    })
    $w('#boxLocker').expand();
}