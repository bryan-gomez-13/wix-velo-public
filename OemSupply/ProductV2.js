import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { memory } from 'wix-storage';
import { getCategory, getSubCategory } from 'backend/collections.web.js';
import { currentMember, authentication } from 'wix-members';

$w.onReady(function () {
    init();
    getUser();
    authentication.onLogin(async (member) => {
        init();
        getUser();
    });
});

// ================================================= INIT =================================================
function init() {
    getCategory().then((resultCategory) => {
        $w('#fCat').options = resultCategory;
        $w('#fCat').value = 'All';
        $w('#fCat').enable();
    });

    $w('#fCat').onChange(() => {
        $w('#fField0').disable();
        $w('#fField0').value = 'All';
        if ($w('#fCat').value !== 'All') {
            getSubCategory($w('#fCat').value).then((resultSubCategory) => {
                $w('#fField0').options = resultSubCategory;
                $w('#fField0').value = 'All';
                $w('#fField0').enable();
            })
        }
        filterDropDown();
    })

    $w('#fField0').onChange(() => {
        filterDropDown();
    })

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