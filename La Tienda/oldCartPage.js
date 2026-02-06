import wixStores from 'wix-stores';
import { products } from 'wix-stores.v2';
import wixWindowFrontend from 'wix-window-frontend';
import { getTerminals } from 'backend/unisendApiIntegration.web.js';
import { local } from "wix-storage-frontend";
import { generalQuery2 } from 'backend/collections.web.js';

let terminals, lockerItem, deleteLocker = false;

$w.onReady(async function () {
    generalQuery2('Velo', '_id', 'ac292a23-9e7c-4e75-bf9d-fa7706c93ba2').then((result) => {
        const item = result[0];
        // console.log(item)
        if (item.activeCode) {
            $w('#secLocker').expand();
            $w('#secCartPage').collapse();

            if (local.getItem('locker')) {
                $w('#shippingType').disable();
                deleteLocker = true;
                lockerItem = JSON.parse(local.getItem('locker'));
                $w('#locker').value = `${lockerItem.name}, ${lockerItem.address}`;
                $w('#locker').disable();
                $w('#boxRepLockers').collapse();
                $w('#lockerMap').location = {
                    latitude: parseFloat(lockerItem.latitude),
                    longitude: parseFloat(lockerItem.longitude),
                    description: `Name: ${lockerItem.name}\nAddress: ${lockerItem.address}\nServicing Hours: ${lockerItem.servicingHours}`,
                }

                setTimeout(() => {
                    $w('#lockerMap').expand();
                }, 500);

                $w('#boxLocker').expand();
            } else {
                $w('#shippingType').enable();
            }
        } else {
            // console.log('Remove')
            local.clear();
            $w('#secLocker').collapse();
            $w('#secCartPage').expand();
        }
    })

    // getUser();
    wixStores.onCartChanged(() => weight());
    weight();
    $w('#checkClearance').onChange(() => weight());
    init();
});

function init() {
    // Type of Shipping
    $w('#shippingType').onChange(() => {
        if ($w('#shippingType').value == 'Parcel Locker') {
            $w('#boxCountry').expand();
            if ($w('#country').value) $w('#boxCity').expand();
            if ($w('#city').value) $w('#boxLocker').expand();
        } else {
            $w('#secLocker').collapse();
            $w('#secCartPage').expand();
        }
    })

    // Country
    $w('#country').onChange(() => {
        $w('#country').disable();
        const country = $w('#country').value;
        $w('#boxCity').collapse();
        $w('#boxCity').collapse();
        $w('#boxLocker').collapse();
        $w('#lockerMap').collapse();

        if (country !== 'Other') {
            $w('#boxLoading').expand();
            getTerminals(country).then((requestTerminals) => {
                // Terminal list
                terminals = requestTerminals;

                // Extract unique cities
                const uniqueCities = [...new Set(requestTerminals.map(item => item.city))]
                    .sort((a, b) => a.localeCompare(b))
                    .map(city => ({ label: city, value: city }));

                $w('#city').options = uniqueCities;
                $w('#country').enable();
                $w('#city').value = '';
                $w('#boxLoading').collapse();
                $w('#boxCity').expand();
            })
        } else {
            $w('#secLocker').collapse();
            $w('#secCartPage').expand();
        }
    })

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

    $w('#okLocker').onClick(() => {
        const localItemString = JSON.stringify(lockerItem)
        local.setItem('locker', localItemString);

        $w('#shippingType').collapse();
        $w('#boxCountry').collapse();
        $w('#boxCity').collapse();

        $w('#secCartPage').expand();
        $w('#secLocker').collapse();
    })

    $w('#deleteLocker').onClick(() => {
        if (deleteLocker) {
            deleteLocker = false;
            $w('#boxLocker').collapse();
            $w('#locker').value = '';
            $w('#locker').enable();
            $w('#boxRepLockers').expand();
            $w('#lockerMap').collapse();
            $w('#shippingType').enable();
        } else {
            $w('#locker').value = '';
            $w('#locker').enable();
            $w('#shippingType').expand();
            if ($w('#shippingType').value == 'Parcel Locker') $w('#boxCountry').expand();
            if ($w('#country').value) $w('#boxCity').expand();
            if ($w('#city').value) $w('#boxLocker').expand();
            $w('#boxRepLockers').expand();
            filterByClickOrInput();
        }

        local.removeItem('locker');
    })
}

export async function weight() {
    let clearance = false;
    let clearanceCheck = false;

    try {
        const cartData = await wixStores.getCurrentCart();
        // console.log(cartData);

        const productInfoPromises = cartData.lineItems.map(item => getProduct(item.productId));
        const productsInfo = await Promise.all(productInfoPromises);

        for (let i = 0; i < cartData.lineItems.length; i++) {
            const item = cartData.lineItems[i];
            const productInfo = productsInfo[i];

            if (!clearance) {
                let checkClearance = productInfo.product.collectionIds.includes("2f8b05b6-24b0-3fc9-69c3-860ab1d89036");
                if (checkClearance) clearance = true;
            }
        }

        // Clearance check
        // console.log("clearance", clearance)
        if (clearance && !($w('#checkClearance').checked)) {
            $w('#checkClearance').show();
            clearanceCheck = false;
        } else {
            $w('#checkClearance').hide();
            clearanceCheck = true;
        }

        // Final UI adjustment
        const formFactor = wixWindowFrontend.formFactor;
        if (clearanceCheck) {
            $w('#box3').hide();
            //if (formFactor === "Mobile") $w('#mobileBox1').hide();
        } else {
            $w('#box3').show();
            //if (formFactor === "Mobile") $w('#mobileBox1').show();
        }
    } catch (error) {
        console.error("Error processing cart:", error);
    }
}

async function getProduct(id) {
    try {
        const result = await products.getProduct(id);
        return result;
    } catch (error) { console.error(error) }
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

    $w('#repLockers').data = newTerminalList;
    $w('#repLockers').onItemReady(($item, itemData) => {
        $item('#lockerName').text = `${itemData.name}, ${itemData.address}`;
    })
    $w('#boxLocker').expand();
}