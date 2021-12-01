import wixData from 'wix-data';
var plans = [];
$w.onReady(async function () {
	await getRegion();
});

export function getRegion(){
	wixData.query("Region")
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			for(let i = 0; i < results.length; i++){
				plans.push({label: results.items[i].title, value: results.items[i].title});
			}
			$w('#dropdown1').options = plans;
		} else {
			console.log('PROBLEM WITH COLLECTION SECTOR')
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

export function button41_click(event) {

	wixData.query("PODNZDB")
	.eq("email", $w('#input2').value)
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			console.log('REPEATED ELEMENT');
		} else {
			$w("#dataset1").setFieldValues( 
				{
					"firstName": $w("#input4").value,
					"lastName":  $w("#input3").value,
					"email":  $w("#input2").value,
					"workPhone": $w("#input5").value,
					"businessName":  $w("#input6").value,
					"website": $w("#input7").value,
					"region": $w("#dropdown1").value,
					"languages": $w("#input8").value,
					"privacyPolicy": $w("#checkbox1").checked
				});
			$w("#dataset1").save();
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}