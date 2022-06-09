import wixData from 'wix-data';

var minimunYear = 1960;

$w.onReady(function () {
    init();
    dropdowns();
    filter();

});

function init() {
    $w('#searchReports').onInput(() => filter())
    $w('#fellowSponsor').onInput(() => filter())
    $w('#fellowshipYear').onChange(() => filter())
    $w('#industry').onChange(() => filter())
    $w('#country').onChange(() => filter())
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

    let year = new Date().getFullYear();
    let years = [{ "label": "All", "value": "All" }];
    for (let a = year; a >= minimunYear; a--) {
        years.push({ "label": a.toString(), "value": a.toString() });
    }
    $w("#fellowshipYear").options = years;
}

// ================================================== FILTER ==================================================
function filter() {
    let filter = wixData.filter();
    //Search Report
    if ($w('#searchReports').value !== '') {
        filter = filter.and((wixData.filter().contains("fellow", $w('#searchReports').value)).or(wixData.filter().contains("topic", $w('#searchReports').value)).or(wixData.filter().contains("keywords", $w('#searchReports').value)));
    }

    //Fellow Sponsor
    if ($w('#fellowSponsor').value !== '') {
        filter = filter.and(wixData.filter().contains("fellowshipPartnerSponsor", $w('#fellowSponsor').value));
    }

    //Fellowship Year
    if ($w('#fellowshipYear').value !== 'All') {
        filter = filter.and(wixData.filter().eq("year", $w('#fellowshipYear').value));
    }

    //Industry
    if ($w('#industry').value !== 'All') {
        filter = filter.and(wixData.filter().contains("category", $w('#industry').value));
    }

    //Country
    if ($w('#country').value !== 'All') {
        filter = filter.and(wixData.filter().contains("country", $w('#country').value));
    }

    if ($w('#searchReports').value == '' && $w('#fellowSponsor').value == '' && $w('#industry').value == 'All' && $w('#country').value == 'All' && $w('#fellowshipYear').value == 'All') {
        filter = filter.and(wixData.filter().eq("featured", true));
    }
    filter = filter.and(wixData.filter().eq("status", true));
    $w('#dynamicDataset').setFilter(filter);
}