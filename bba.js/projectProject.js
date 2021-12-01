import wixData from 'wix-data';
import {session} from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
	sector();
});

export function sector(){
	var itemObj = $w("#dynamicDataset").getCurrentItem();
    wixData.query("Items")
    .eq('_id', itemObj._id)
	.include('sector')
    .find()
    .then((results) => {
        let sector = results.items[0].sector;
		let sectorText = '';
		let sectorArray = [];
		for(let i = 0; i < sector.length; i++){
			sectorArray.push({label: sector[i].title, value: sector[i]._id})
			if (i == sector.length - 1){
				sectorText += sector[i].title;
			}else{
				sectorText += sector[i].title + ' - ';
			}
		}
		$w('#selectionSector').options = sectorArray;
		$w('#sector').text = sectorText;
    });

	wixData.query("Items")
    .eq('_id', itemObj._id)
	.include('services')
    .find()
    .then((results) => {
		let service = results.items[0].services;
		let serviceText = '';
		for(let i = 0; i < service.length; i++){
			if(i == service.length -1){
				serviceText += service[i].title;
			}else{
				serviceText += service[i].title + ' - ';
			}
			
		}
		$w('#service').text = serviceText;
    });
}

export function selectionSector_click(event) {
	let sector = $w('#selectionSector').value[0];
	session.setItem("filterSector", sector);
	wixLocation.to('/project');
}