import wixData from 'wix-data';
var plans = [];
$w.onReady(async function () {
	await getSector();
});

export function getSector(){
	wixData.query("sector")
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

export function button2_click(event) {
	wixData.query("FederationDB")
	.eq("email", $w("#input2").value)
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			console.log('REPEATED ELEMENT')
		} else {
			if($w("#dropdown1").value == 'Other'){
				$w("#dataset1").setFieldValues( 
				{
					"firstName": $w("#input4").value,
					"lastName":  $w("#input3").value,
					"email":  $w("#input2").value,
					"position": $w("#input5").value,
					"organisation":  $w("#input6").value,
					"sector": $w("#input7").value,
					"privacyPolicy": $w("#checkbox1").value
				});
				$w("#dataset1").save();
			}else{
				$w("#dataset1").setFieldValues( 
				{
					"firstName": $w("#input4").value,
					"lastName":  $w("#input3").value,
					"email":  $w("#input2").value,
					"position": $w("#input5").value,
					"organisation":  $w("#input6").value,
					"sector": $w("#dropdown1").value
				});
				$w("#dataset1").save();
			}
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

export function dropdown1_change(event) {
	if($w('#dropdown1').value == 'Other'){
		$w('#input7').expand();
	}else{
		$w('#input7').collapse();
	}
}