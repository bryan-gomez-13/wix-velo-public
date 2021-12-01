import wixData from 'wix-data';
import wixWindow from 'wix-window';

$w.onReady(function () {
	
});

export function save_Click(event) {
	//Get the device
	let device = wixWindow.formFactor;
	let title = event.target.id;
	let toInsert = {title,device};
	wixData.insert('clicks', toInsert)
		.then(() => {
			//console.log(toInsert)
		}).catch((error) => {
			console.error(error)
		});
}
