import wixData from 'wix-data';

var array = []

$w.onReady(function () {

});

export async function getItems() {
    $w('#bSearch').disable();
    let results = await wixData.query("Stores/Products").limit(100).find().then();
    await checkList(results);
    while (results.hasNext()) {
        results = await results.next();
        await checkList(results);
    }
    $w('#bSearch').enable();
}

export async function consult_click(event) {
    await getCollection();
    await getItems();
}

export async function checkList(results) {
    for (let i = 0; i < results.items.length; i++) {
        if (results.items[i].additionalInfoSections != '') {
            if (results.items[i].additionalInfoSections[0].description != "N/A") {
                if (results.items[i].additionalInfoSections[0].description != 'N.A.') {
                    let dateProduct;
                    let date, date1, date2;

                    if (((results.items[i].additionalInfoSections[0].description).includes('<p>') == true) || ((results.items[i].additionalInfoSections[0].description).includes('</p>') == true)) {
                        date = results.items[i].additionalInfoSections[0].description;
                        date1 = await date.replace('<p>','')
                        date2 = await date1.replace('</p>','')
                        //let newDate = date.slice(3, date.length - 5)
                        let newDate = date2
                        dateProduct = new Date(newDate).valueOf();
                        date = newDate;
                        //console.log(i)
                    } else {
                        dateProduct = new Date(results.items[i].additionalInfoSections[0].description).valueOf();
                        date = results.items[i].additionalInfoSections[0].description;
                        //console.log(i)
                    }
                    //console.log(i)

                    let dateNow = Date.now();

                    let days = parseInt((dateProduct - dateNow) / (1000 * 60 * 60 * 24), 10);
                    let name = results.items[i].name;
                    let sku = results.items[i].sku;
                    let inventory = results.items[i].quantityInStock;
                    let inStock = results.items[i].inStock;

                    let toInsert = {
                        name,
                        sku,
                        date,
                        days,
                        inventory,
                        inStock
                    }
                    await saveProduct(toInsert);
                }
            }
        }
    }
}

export function saveProduct(toInsert) {
    wixData.insert('BestBefore', toInsert)
        .then(() => {
            console.log("ready");
        }).catch((error) => {
            console.error(error)
        });
}

export function searchDays(event) {
    getElements($w('#inStock').value);
}

export async function getCollection(event) {
    let results = await wixData.query("BestBefore").limit(100).find().then();
    //console.log(results.items.length)
    await order(results.items, array);
    while (results.hasNext()) {
        results = await results.next();
        //console.log(results.items.length)
        await order(results.items, array);
    }
    //console.log(array)
    await wixData.bulkRemove("BestBefore", array)
    array = [];
    //console.log(array)

}

export function order(results, array) {
    //console.log(results)
    if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            array.push(results[i]._id)
        }
    }
}

export function inStock(event) {
    getElements($w('#inStock').value)
}

export function getElements(Stock){
    let filter = wixData.filter();
    let sort = wixData.sort();
    let x = $w('#inputSearch').value;
    filter = filter.le("days", parseInt(x, 10));
    if(Stock == "Yes"){
        filter = filter.le("days", parseInt(x, 10)).and(filter.eq("inStock",true));
    }else if(Stock == "No"){
        filter = filter.le("days", parseInt(x, 10)).and(filter.eq("inStock",false));
    }
    $w('#dataset1').setFilter(filter).then(() => $w('#dataset1').setSort(sort.ascending('days')));
    $w('#table1').expand();
}