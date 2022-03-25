import wixData from 'wix-data'
var cat1 = [];
var cat2 = [];
var arrayCat1 = [];
var arrayCat2 = [];

$w.onReady(function () {
    init();
    getDropDownOne();
});
// ================================================= I N I T =================================================
function init() {
    $w('#Cat1').onChange(() => getDropDownTwo());

    $w('#Cat2').onChange(() => filterDropDown());
    $w('#CatSort').onChange(() => filterDropDown());
    $w('#CatInput').onInput(() => filterDropDown());

    //$w('#search').onClick(() => filterDropDown())
}

// ================================================= FILTER
function filterDropDown() {
    let oem1 = $w('#Cat1').value;
    let oem2 = $w('#Cat2').value;
    let searchCat = $w('#CatInput').value;
    let sort = wixData.sort();

    //console.log(oem1, oem2)

    var filter = wixData.filter()
    var f = wixData.filter();
    // ==================== OEM
    if (oem1 !== 'All') {
        //console.log(1)
        filter = filter.and(f.eq("oem1", oem1));
    }
    if (oem2 !== 'All') {
        //console.log(2)
        filter = filter.and(f.eq("oem2", oem2));
    }

    // ==================== KEYWORD
    if (searchCat.length > 0 ) {
        //console.log(3)
        filter = filter.or((f.contains("oem1", searchCat)).or(f.contains("oem2", searchCat)).or(f.contains("oem3", searchCat)).or(f.contains("code", searchCat)));
    }

    filter = filter.and(f.eq("inStock", 1));

    // ==================== SORT
    if ($w('#CatSort').value == "Ascending") {
        sort = sort.ascending('price');
    } else {
        sort = sort.descending('price');
    }

    $w("#Category").setFilter(filter).then(() => $w('#Category').setSort(sort));
}

// ================================================= D R O P D O W N - O N E =================================================
export async function getDropDownOne() {
    $w('#Cat1').disable();
    //let results = await wixData.query('ProductCatalog').eq('inStock',1).limit(1000).ascending("oem1").find().then();
    let results = await wixData.query('ProductCategories').eq('active',1).limit(1000).ascending("name").find().then();
    if (results.items.length > 0) {
        cat1 = [{ "label": "All", "value": "All" }];
        dropCat1(results, cat1, arrayCat1);
        while (results.hasNext()) {
            results = await results.next();
            dropCat1(results, cat1, arrayCat1);
        }
        $w('#Cat1').enable();
        $w('#Cat1').options = cat1;
        //$w('#model').updateValidityIndication();
        cat1 = [];
        arrayCat1 = [];
    }
    filterDropDown();
}

export function dropCat1(results, cat1, arrayCat1) {
    if (results.items.length > 0) {
        //arrayCat1 = getCat1(results, arrayCat1);
        /*
        for (let i = 0; i < arrayCat1.length; i++) {
            cat1.push({ label: arrayCat1[i], value: arrayCat1[i] })
        }
        */
        for (let i = 0; i < results.items.length; i++) {
            cat1.push({ label: results.items[i].name, value: results.items[i].name })
        }
    }
}

export function getCat1(results, arrayCat1) {
    for (let i = 0; i < results.items.length; i++) {
        if (arrayCat1.includes(results.items[i].name) == false) {
            arrayCat1.push(results.items[i].name)
        }
    }
    return arrayCat1;
}

// ================================================= D R O P D O W N - T W O =================================================
export async function getDropDownTwo() {
    await filterDropDown();

    $w('#Cat2').disable();
    let results = await wixData.query('ProductCatalog').eq('oem1', $w('#Cat1').value).and(wixData.query('ProductCatalog').eq('inStock',1)).limit(1000).ascending("oem2").find().then();
    if (results.items.length > 0) {
        cat2 = [{ "label": "All", "value": "All" }];
        dropCat2(results, cat2, arrayCat2);
        while (results.hasNext()) {
            results = await results.next();
            dropCat2(results, cat2, arrayCat2);
        }
        $w('#Cat2').enable();
        $w('#Cat2').options = cat2;
        //$w('#model').updateValidityIndication();
        cat2 = [];
        arrayCat2 = [];
    }
}

export function dropCat2(results, cat2, arrayCat2) {
    if (results.items.length > 0) {
        arrayCat2 = getCat2(results, arrayCat2);
        for (let i = 0; i < arrayCat2.length; i++) {
            cat2.push({ label: arrayCat2[i], value: arrayCat2[i] })
        }
    }
}

export function getCat2(results, arrayCat2) {
    for (let i = 0; i < results.items.length; i++) {
        if (arrayCat2.includes(results.items[i].oem2) == false) {
            arrayCat2.push(results.items[i].oem2)
        }
    }
    return arrayCat2;
}