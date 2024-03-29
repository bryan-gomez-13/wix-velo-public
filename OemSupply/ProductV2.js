import wixData from 'wix-data'
import wixLocation from 'wix-location';
import { memory } from 'wix-storage';
import { currentMember, authentication } from 'wix-members';

var arrayR = [],
    arrayC = []
$w.onReady(function () {
    init();
    getDropCategory();
    getUser();
    authentication.onLogin(async (member) => {
        init();
        getDropCategory();
        getUser();
    });
});

// ================================================= INIT =================================================
function init() {
    $w('#fCat').onChange(() => getDropDownTwo());
    $w('#fField0').onChange(() => filterDropDown());
    $w('#fKeyWord').onInput(() => filterDropDown());

    $w('#repOEM').onItemReady(($item, itemData) => {
        if (itemData.field1 !== undefined) $item('#field123').text = itemData.field1
        if (itemData.field2 !== undefined) $item('#field123').text += " " + itemData.field2
        if (itemData.field3 !== undefined) $item('#field123').text += " " + itemData.field3

        if (itemData.field4) $item('#group1').expand();
        $item('#contact').onClick(() => {
            console.log(itemData.field5)
            memory.setItem("product", itemData.field5);
            wixLocation.to("/contact-us");
        })
    })
}
// ================================================= GET DROPDOWNS =================================================
async function getDropCategory() {
    let products = await wixData.query('ProductsCatalog').ascending('order').ne("100Nett", "100 Nett").limit(1000).find()
    arrayR = [{ "label": "All", "value": "All" }];
    dropCat(products, arrayC, "category");
    while (products.hasNext()) {
        products = await products.next();
        dropCat(products, arrayC, "category");
    }

    //console.log(arrayC)
    for (let i = 0; i < arrayC.length; i++) {
        arrayR.push({ label: arrayC[i], value: arrayC[i] })
    }

    $w('#fCat').enable();
    $w('#fCat').options = arrayR;

    arrayR = [];
    arrayC = [];
}

async function getDropDownTwo() {
    $w('#fField0').value = "All"
    $w('#fField0').disable();
    let products = await wixData.query('ProductsCatalog').eq('category', $w('#fCat').value).ne("100Nett", "100 Nett").ascending('order').limit(1000).find()
    arrayR = [{ "label": "All", "value": "All" }];
    dropCat(products, arrayC, "field0");
    while (products.hasNext()) {
        products = await products.next();
        dropCat(products, arrayC, "field0");
    }
    //console.log(arrayC)
    for (let i = 0; i < arrayC.length; i++) {
        arrayR.push({ label: arrayC[i], value: arrayC[i] })
    }

    $w('#fField0').enable();
    $w('#fField0').options = arrayR;

    arrayR = [];
    arrayC = [];

    filterDropDown();
}

export function dropCat(products, arrayC, field) {
    if (products.items.length > 0) {
        arrayC = getCat(products, arrayC, field);
    }
}

export function getCat(products, arrayC, field) {
    for (let i = 0; i < products.items.length; i++) {
        if (arrayC.includes(products.items[i][field]) == false) {
            arrayC.push(products.items[i][field])
        }
    }
    return arrayC;
}
// ================================================= FILTER =================================================
function filterDropDown() {
    let sort = wixData.sort();
    sort = sort.ascending("order");
    let category = $w('#fCat').value;
    let field0 = $w('#fField0').value;
    let searchCat = $w('#fKeyWord').value;

    let filter = wixData.filter()
    let f = wixData.filter();

    // ==================== DROP
    if (category !== 'All') filter = filter.and(f.eq("category", category));
    if (field0 !== 'All') filter = filter.and(f.eq("field0", field0));
    filter = filter.and(f.ne("100Nett", "100 Nett"));
    filter = filter.and(f.isNotEmpty("field0"));

    // ==================== KEYWORD
    if (searchCat.length > 0) filter = filter.or((f.contains("category", searchCat)).or(f.contains("field0", searchCat)).or(f.contains("field5", searchCat)));

    $w("#dataProduct").setFilter(filter)
    $w("#dataProduct").setSort(sort);
}

function getUser() {
    currentMember.getMember().then((member) => {
        if (member) $w('#price').expand();
        else $w('#price').collapse();
    }).catch((error) => console.error(error));
}