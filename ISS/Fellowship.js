import wixData from 'wix-data';

var minimunYear = 1991;

$w.onReady(function () {
    init();
    dropdowns();
    getsponsor();
    getYear();
    filter();

});

function init() {
    $w('#searchReports').onInput(() => filter())
    //$w('#fellowSponsor').onInput(() => filter())
    $w('#dropFellowship').onChange(() => filter())
    $w('#fellowshipYear').onChange(() => filter())
    $w('#industry').onChange(() => filter())
    $w('#country').onChange(() => filter())
    $w('#search').onClick(() => filter())
    console.log($w('#image').src)
    $w('#rep').onItemReady(($item, itemData, index) => {
        if (itemData.image.length > 0) $item('#image').src = itemData.image;
        else $item('#image').src = "wix:image://v1/73f5ce_2a19b36da9894c7989de33f9f1c1d02c~mv2.png/_.png#originWidth=1200&originHeight=1474";
    })
}

// ================================================== DROPDOWNS ==================================================
function dropdowns() {
    wixData.query("Country")
        .ascending('title')
        .find()
        .then((results) => {
            let sectors = [{ "label": "All", "value": "All" }];
            for (let i = 0; i < results.items.length; i++) {
                sectors.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#country').options = sectors;
        });

    wixData.query("Category")
        .ascending('title')
        .find()
        .then((results) => {
            let sectors = [{ "label": "All", "value": "All" }];
            for (let i = 0; i < results.items.length; i++) {
                sectors.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#industry').options = sectors;
        });

    /*
    let year = new Date().getFullYear();
    let years = [{ "label": "All", "value": "All" }];
    for (let a = year; a >= minimunYear; a--) {
        years.push({ "label": a.toString(), "value": a.toString() });
    }
    $w("#fellowshipYear").options = years;
    */
}

//Fellowship sponsor - Dropdown
async function getsponsor() {
    var sponsor = []
    var array = []
    $w('#dropFellowship').disable()
    let results = await wixData.query("Fellowships").ascending("fellowshipPartnerSponsor").limit(1000).find().then();
    //console.log(results)
    if (results.items.length > 0) {
        sponsor = [{ "label": "All", "value": "All" }];
        await dropDownSponsor(results, sponsor, array, 'sponsor');
        while (results.hasNext()) {
            results = await results.next();
            await dropDownSponsor(results, sponsor, array);
        }
        //console.log(sponsor)
        $w('#dropFellowship').options = sponsor;
        $w('#dropFellowship').enable();
        //$w('#dropFellowship').updateValidityIndication();
    }
}

//Fellowship sponsor - Dropdown
async function getYear() {
    var year = []
    var arrayY = []
    $w('#fellowshipYear').disable()
    let results = await wixData.query("Fellowships").descending("year").limit(1000).find().then();
    //console.log(results)
    if (results.items.length > 0) {
        year = [{ "label": "All", "value": "All" }];
        await dropDownSponsor(results, year, arrayY, 'year');
        while (results.hasNext()) {
            results = await results.next();
            await dropDownSponsor(results, year, arrayY);
        }
        //console.log(year)
        $w('#fellowshipYear').options = year;
        $w('#fellowshipYear').enable();
        //$w('#dropFellowship').updateValidityIndication();
    }
}

function dropDownSponsor(results, sponsor, array, topic) {
    if (results.items.length > 0) {
        array = getArray(results, array, topic);
        for (let i = 0; i < array.length; i++) {
            sponsor.push({ label: array[i], value: array[i] })
        }
    }
}

function getArray(results, array, topic) {
    for (let i = 0; i < results.items.length; i++) {
        let itemArray;
        if (topic == 'year') itemArray = results.items[i].year;
        else itemArray = results.items[i].fellowshipPartnerSponsor;
        if (itemArray !== "" && itemArray && itemArray !== " " && itemArray !== "  ") {
            ///* OPTION1
            let coma = itemArray.split(',')
            let puntoComa = itemArray.split(';')
            let forItem = []
            if (coma.length > 1) forItem = coma
            else forItem = puntoComa
            //console.log(forItem)
            for (let x = 0; x < forItem.length; x++) {
                //if (array.includes(itemArray) == false && itemArray !== "") array.push(itemArray)
                if (array.includes(forItem[x]) == false) array.push(forItem[x])
            }
            //*/

            /* OPTION2
            let arrayValidation = false
            for (let x = 0; x < array.length; x++) {
                if (array[x] == itemArray) {
                    arrayValidation = true
                    break
                }
            }
            if (!(arrayValidation)) array.push(itemArray)
            */
        }
    }
    /*
    for (let i = 0; i < results.items.length; i++) {
        if (itemArray !== "" && itemArray && itemArray !== " ") {
            let x = true
            while (x) {
                console.log(itemArray)
                let arrayWhile = itemArray.split(' ')
                console.log(arrayWhile)
                if (arrayWhile[0] == "") itemArray = itemArray.slice(1, -1)
                else x = false
            }
            //console.log(itemArray)
            let coma = itemArray.split(',')
            let puntoComa = itemArray.split(';')
            let forItem = []
            if (coma.length > 0) forItem = coma
            else forItem = puntoComa
            //console.log(forItem)
            for (let x = 0; x < forItem.length; x++) {
                //if (array.includes(itemArray) == false && itemArray !== "") array.push(itemArray)
                if (array.includes(forItem[x]) == false) array.push(forItem[x])
            }
        }
    }
    */
    return array;
}

// ================================================== FILTER ==================================================
function filter() {
    let filter = wixData.filter();
    //Search Report
    if ($w('#searchReports').value !== '') {
        filter = filter.and((wixData.filter().contains("fellow", $w('#searchReports').value)).or(wixData.filter().contains("topic", $w('#searchReports').value)).or(wixData.filter().contains("keywords", $w('#searchReports').value)));
    }

    //Fellow Sponsor
    if ($w('#dropFellowship').value !== 'All') filter = filter.and(wixData.filter().contains("fellowshipPartnerSponsor", $w('#dropFellowship').value));
    //if ($w('#fellowSponsor').value !== '') filter = filter.and(wixData.filter().contains("fellowshipPartnerSponsor", $w('#fellowSponsor').value));

    //Fellowship Year
    if ($w('#fellowshipYear').value !== 'All') filter = filter.and(wixData.filter().eq("year", $w('#fellowshipYear').value));

    //Industry
    if ($w('#industry').value !== 'All') filter = filter.and(wixData.filter().contains("category", $w('#industry').value));

    //Country
    if ($w('#country').value !== 'All') filter = filter.and(wixData.filter().contains("country", $w('#country').value));

    if ($w('#searchReports').value == '' && $w('#dropFellowship').value == 'All' && $w('#industry').value == 'All' && $w('#country').value == 'All' && $w('#fellowshipYear').value == 'All') filter = filter.and(wixData.filter().eq("featured", true));

    filter = filter.and(wixData.filter().eq("status", true));
    $w('#dynamicDataset').setFilter(filter);
}