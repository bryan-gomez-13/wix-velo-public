import wixData from 'wix-data';
import {session} from 'wix-storage';
let variable = session.getItem("filterSector")

$w.onReady(function () {
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
		if(variable != null){
			let filter = wixData.filter().hasSome("sector",variable);
			$w('#dynamicDataset').setFilter(filter);
			let sector = $w('#checkboxSectors').options;
			let option = 0;
			for(let i = 0; i < sector.length; i++){
				if(sector[i].value == variable){
					option = i;
					break
				}
			}
			console.log(variable);
			console.log(option);
			$w("#checkboxSectors").selectedIndices = [option];
			session.clear();
		}
	});
}

export function checkboxSectors_change(event) {
	let sectors = $w('#checkboxSectors').value;
	let filter = wixData.filter().hasSome("sector",sectors);
	$w('#dynamicDataset').setFilter(filter);
}