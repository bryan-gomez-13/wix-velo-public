import wixData from 'wix-data';
import {session} from 'wix-storage';
let variable = session.getItem("filterSector")

$w.onReady(function () {
	if(variable != null){
		filterSector();
	}
	getCheckBoxElements();
});

export function getCheckBoxElements(){
	wixData.query("Sectors")
	.find()
	.then((results) => {
		let sectors = [];
		for (let i = 0; i < results.items.length; i++) {
			sectors.push({ label: results.items[i].title, value: results.items[i]._id })
		}
		$w('#checkboxSectors').options = sectors;
	});

	wixData.query("services")
	.find()
	.then((results) => {
		let services = [];
		for (let i = 0; i < results.items.length; i++) {
			services.push({ label: results.items[i].title, value: results.items[i]._id })
		}
		$w('#checkboxServices').options = services;
	});
}

export function checkboxSectors_change(event) {
	filter();
}

export function checkboxServices_change(event) {
	filter();
}

export function filter(){

	let services = $w('#checkboxServices').value;
	let sectors = $w('#checkboxSectors').value;
	let filter = wixData.filter();
	
	if(services.length > 0 && sectors.length > 0){
		filter = filter.hasSome("sector",sectors).and(filter.hasSome("services",services));
	}else if(services.length > 0 && sectors.length == 0){
		filter = filter.hasSome("services",services);
	}else{
		filter = filter.hasSome("sector",sectors);
	}

	$w('#dynamicDataset').setFilter(filter);
}

export function filterSector(){
	let filter = wixData.filter().hasSome("sector",variable);
	$w('#dynamicDataset').setFilter(filter);
	session.clear();
}

