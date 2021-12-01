import wixData from 'wix-data';
var select = [];
var masterclassess = [];

$w.onReady(async function () {
	await getOptions();
});

export function getOptions(){
	wixData.query("options")
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for(let i = 0; i < results.length; i++){
				select.push({label: results.items[i].title, value: results.items[i].title});
			}
			$w('#dropdown1').options = select;
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );

	wixData.query("masterclassess")
	.ascending("Title")
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for(let i = 0; i < results.length; i++){
				masterclassess.push({label: results.items[i].title, value: results.items[i].title});
			}
			$w('#checkboxGroup1').options = masterclassess;
		} else {
		// handle case where no matching items found
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

export function dropdown1_change(event) {
	if($w('#dropdown1').value == 'Masterclassess'){
		$w('#checkboxGroup1').expand();
	}else{
		$w('#checkboxGroup1').collapse();
	}
}

export function input8_input(event) {
	let x = $w('#input8').value;
	if( (x.includes('@gmail') == true || x.includes('@yahoo') == true || x.includes('@hotmail') == true || x.includes('@outlook') == true) || x.includes('@') == false){
		$w('#button27').collapse();
	}else{
		$w('#button27').expand();
	}
}