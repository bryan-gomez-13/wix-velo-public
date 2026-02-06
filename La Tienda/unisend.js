import { getTerminals } from 'backend/unisendApiIntegration.web.js';

let terminals;
$w.onReady(function () {
    init();
});

function init() {
    $w('#shippingType').onChange(() => {
        if ($w('#shippingType').value == 'Parcel Locker') {
            $w('#boxCountry').expand();
            if ($w('#country').value) $w('#boxCity').expand();
            if ($w('#city').value) $w('#boxLocker').expand();
        } else {
            $w('#boxCountry').collapse();
            $w('#boxCity').collapse();
            $w('#boxLocker').collapse();
            $w('#lockerMap').collapse();
        }
    })

    $w('#country').onChange(() => {
        const country = $w('#country').value;
        $w('#boxCity').collapse();
        $w('#boxCity').collapse();
        $w('#boxLocker').collapse();
        $w('#lockerMap').collapse();

        if (country !== 'Other') {
            getTerminals(country).then((requestTerminals) => {
                // Terminal list
                terminals = requestTerminals;

                // Extract unique cities
                const uniqueCities = [...new Set(requestTerminals.map(item => item.city))]
                    .sort((a, b) => a.localeCompare(b))
                    .map(city => ({ label: city, value: city }));

                $w('#city').options = uniqueCities;
                $w('#city').value = '';
                $w('#boxCity').expand();

            })
        }
    })

    $w('#city').onChange(() => {
        $w('#boxLocker').collapse();
        $w('#lockerMap').collapse();

        const city = $w('#city').value;
        const newTerminalList = terminals.filter(item => item.city == city);

        repLockers(newTerminalList)
    })

    $w('#locker').onInput(() => { filterByClickOrInput() })

    $w('#boxRepName').onClick((event) => {
        const itemId = event.context.itemId;
        const itemData = $w('#repLockers').data.find(item => item._id == itemId);

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
}

function filterByClickOrInput() {
    const searchValue = $w('#locker').value.toLowerCase(); // Convert input to lowercase
    const newTerminalList = terminals.filter(item => item.address.toLowerCase().includes(searchValue) || item.name.toLowerCase().includes(searchValue));
    repLockers(newTerminalList)
}

function repLockers(newTerminalList) {
    $w('#repLockers').data = newTerminalList;
    $w('#repLockers').onItemReady(($item, itemData) => {
        $item('#lockerName').text = `${itemData.name}, ${itemData.address}`;
    })
    $w('#boxLocker').expand();
}