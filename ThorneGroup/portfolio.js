// Para obtener la documentación completa sobre las funciones API, incluidos ejemplos para programa con código, visita http://wix.to/94BuAAs
import { local } from 'wix-storage';
import { session } from 'wix-storage';
import wixData from 'wix-data';

// TODO: write your page related code here...
const linkField = "link-portfolio-title"; // replace this value

$w.onReady(function () {
    options();
    init();
});

function init() {
    $w('#category').onChange(() => filter())
    $w('#dataset1').onCurrentIndexChanged(() => currentIndex());
    $w('#dataset1').onReady(() => readyDataset())
    $w('#dataset1').onItemValuesChanged(() => itemValues())
}

function readyDataset() {
    // Add your code for this event here: 
    let numberOfItems = $w("#dataset1").getTotalCount();

    $w("#dataset1").getItems(0, numberOfItems)
        .then((result) => {
            //console.log(result);
            let dynamicPageURLs = result.items.map(item => item[linkField]);
            local.setItem('dynamicPageURLs', dynamicPageURLs);
        })
        .catch((err) => {
            console.log(err.code, err.message);
        });
}

function itemValues() {
    // Add your code for this event here: 
    let numberOfItems = $w("#dataset1").getTotalCount();

    $w("#dataset1").getItems(0, numberOfItems)
        .then((result) => {
            console.log(result);
            let dynamicPageURLs = result.items.map(item => item[linkField]);
            local.setItem('dynamicPageURLs', dynamicPageURLs);
        })
        .catch((err) => {
            console.log(err.code, err.message);
        });
}

function currentIndex() {
    // Add your code for this event here: 
    let numberOfItems = $w("#dataset1").getTotalCount();

    $w("#dataset1").getItems(0, numberOfItems)
        .then((result) => {
            // console.log(result);
            let dynamicPageURLs = result.items.map(item => item[linkField]);
            console.log()
            local.setItem('dynamicPageURLs', dynamicPageURLs);
        })
        .catch((err) => {
            console.log(err.code, err.message);
        });
}

function options() {
    wixData.query("PortfolioFilter").ascending('title').find().then(async (results) => {
            if (results.items.length > 0) {
                //console.log(results.items)
                let type = [{ "label": "All", "value": "All" }];
                for (let i = 0; i < results.items.length; i++) {
                    type.push({ label: results.items[i].title, value: results.items[i]._id })
                }
                $w('#category').options = type;
                if (session.getItem("filterGallery")) $w('#category').value = session.getItem("filterGallery"), await filter(), session.clear();
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });

}

function filter() {
    let category = $w('#category').value;
    let filter = wixData.filter()
    if (category !== 'All') filter = filter.hasSome("filters", category)
    $w("#dataset1").setFilter(filter)
}