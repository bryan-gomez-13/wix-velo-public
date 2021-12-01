import wixData from 'wix-data';

const HL_COLOR = 'rgb(190,190,250)'; // highlight color - for makred items
const REG_COLOR = 'rgb(180,180,222)'; // regular color - for unmarked items 
const maxListSize = 5;

let listSize; // the number of displayed items in the repeater
let currIndex = -1; // the current index of the selected item
let debounceTimer;

$w.onReady(function () {
    $w('#submitButton').onClick(() => handleSubmit());
    $w('#rptDropdown').onItemReady(($item, itemData, index) => itemReadyHandler($item, itemData, index));
    $w('#countryInput').onKeyPress((event) => keyPressHandler(event.key));
    $w('#countryInput').onFocus(() => keyPressHandler()); // trigger the default case inside the handler 
    $w('#backgroundBox').onClick(() => $w('#rptDropdown').collapse());
});

function keyPressHandler(key) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    debounceTimer = setTimeout(() => { // wrapping the handler with setTimeOut in order to delay the handling to the point the user has finished typing
        if ($w('#countryInput').value.length === 0) {
            currIndex = -1;
            $w('#rptDropdown').collapse();
        } else {

            switch (key) {
            case 'Enter':
                $w('#countryInput').value = $w('#rptDropdown').data[currIndex].title;
                $w('#rptDropdown').collapse();
                break;
            case 'ArrowUp':
                if (currIndex > 0) {
                    currIndex = currIndex - 1;
                    refreshItemsColors();
                }
                break;
            case 'ArrowDown':
                if (currIndex < listSize - 1) {
                    currIndex = currIndex + 1;
                    refreshItemsColors();
                }
                break;
            case 'Escape':
                $w('#countryInput').value = '';
                currIndex = -1;
                $w('#rptDropdown').collapse();
                break;
            default:
                currIndex = -1;
                wixData.query('Countries')
                    .startsWith('title', $w('#countryInput').value)
                    .ascending('title')
                    .limit(maxListSize)
                    .find()
                    .then((res) => {
                        if (res.items.length !== 0) {
                            $w('#rptDropdown').data = [];
                            $w('#rptDropdown').data = res.items;
                            listSize = res.items.length;
                            $w('#rptDropdown').expand()
                        } else {
                            $w('#rptDropdown').collapse();
                        }
                    });
                break;
            }
        }
    }, 250);
}

function itemReadyHandler($item, itemData, index) {

    $item('#countryNameText').text = itemData.title;

    if (index === currIndex) { // the user has navigated to this item
        $item('#rptBox').style.backgroundColor = HL_COLOR; // highlight this item
    } else {
        $item('#rptBox').style.backgroundColor = REG_COLOR; // use the regular color for all other items
    }

    $item('#container1').onClick(() => {
        $w('#countryInput').value = itemData.title;
        $w('#rptDropdown').collapse();
    });
}

function refreshItemsColors() {
    $w('#rptDropdown').forEachItem(($item, itemData, index) => {
        if (index === currIndex) {
            $item('#rptBox').style.backgroundColor = HL_COLOR;
        } else {
            $item('#rptBox').style.backgroundColor = REG_COLOR;
        }
    });
}

function setInputValidations() {
    $w('#nameInput').required = true;
    $w('#emailInput').required = true;
    $w('#countryInput').required = true;
}

/*
state,
association,
club,
contactName,
contactEmail,
contactPhone,
url,
checkbox
*/

function handleSubmit() {

    setInputValidations();
    if (isValidForm()) {
        const name = $w('#nameInput').value;
        const email = $w('#emailInput').value;
        const country = $w('#countryInput').value;
        const toInsert = {
            name,
            email,
            country
        };
        wixData.insert('Data', toInsert)
            .then(() => {
                $w('#successText').expand();
            }).catch((error) => {
                console.error(error)
            });
    }
}

function isValidForm() {
    const nameValidationMsg = $w('#nameInput').validationMessage;
    const emailValidationMsg = $w('#emailInput').validationMessage;
    const countryValidationMsg = $w('#countryInput').validationMessage;

    if (nameValidationMsg !== '') {
        $w('#invalidNameText').text = nameValidationMsg;
        $w('#invalidNameText').expand();
    } else {
        $w('#invalidNameText').collapse();
    }
    if (emailValidationMsg !== '') {
        $w('#invalidEmailText').text = emailValidationMsg;
        $w('#invalidEmailText').expand();
    } else {
        $w('#invalidEmailText').collapse();
    }
    if (countryValidationMsg !== '') {
        $w('#invalidCountryText').text = countryValidationMsg;
        $w('#invalidCountryText').expand();
    } else {
        $w('#invalidCountryText').collapse();
    }
    const result = $w('#nameInput').valid && $w('#emailInput').valid && $w('#countryInput').valid;
    return result;
}