import wixData from 'wix-data'

var make = [];
var city = [];

$w.onReady(function () {
    init();
    getDropDown();
});

function init() {
    //$w('#searchB').onClick(() => filter());
	$w('#make').onChange(() => filter("Make"))
	$w('#model').onChange(() => filter("City"))
	$w('#search').onInput(() => filter("Search"))
}

export async function getDropDown() {
    let makeList = await wixData.query("Make").ascending("make").limit(1000).find().then();
    make = [{ "label": "All", "value": "All" }];
    await dropDownMake(makeList, make);
    while (makeList.hasNext()) {
        makeList = await makeList.next();
        dropDownMake(makeList, make);
    }

    let cityList = await wixData.query("Models").ascending("model").limit(1000).find().then();
    city = [{ "label": "All", "value": "All" }];
    await dropDownCity(cityList, city);
    while (cityList.hasNext()) {
        cityList = await cityList.next();
        dropDownMake(cityList, city);
    }
}

export function dropDownMake(results, make) {
    if (results.items.length > 0) {
        for (let i = 0; i < results.items.length; i++) {
            make.push({ label: results.items[i].make, value: results.items[i]._id })
        }
        $w('#make').options = make;
    }
}

export function dropDownCity(results, city) {
    if (results.items.length > 0) {
        for (let i = 0; i < results.items.length; i++) {
            city.push({ label: results.items[i].model, value: results.items[i]._id })
        }
        $w('#model').options = city;
    }
}

function filter(Type) {
    let makeDrop = $w('#make').value;
    let cityDrop = $w('#model').value;
	let searchIT = $w('#search').value;
	console.log(makeDrop,1, cityDrop,2,searchIT,3)

	var filter = wixData.filter()
	var f = wixData.filter();

	if( makeDrop !== 'All' ){
		//console.log(1)
		filter = filter.and(f.eq("jobMake", makeDrop));
	}
	if( cityDrop !== 'All' ){
		//console.log(2)
		filter = filter.and(f.eq("jobTownOrCity", cityDrop));
	}
	if( searchIT !== "" || searchIT !== null || searchIT !== undefined ){
		//console.log(3)
		filter = filter.and(f.contains("title", searchIT));
	}
	$w("#dataset1").setFilter(filter)
}