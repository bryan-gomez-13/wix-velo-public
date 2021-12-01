import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
	$w('#association').disable();
	$w('#club').disable();
	getState();

	$w('#state').onChange(() => {
		wixData.query('AFLdropDown')
		.eq('stateName',$w('#state').value)
		.limit(1000)
		.ascending("associationName")
		.find()
		.then( (results) => {
			if(results.items.length > 0) {
				let association = getArray(results);
				let associationDropdown = [];
				//console.log('association');
				//console.log(association);
				for (let i = 0; i < association.length; i++) {
					associationDropdown.push({ label: association[i], value: association[i] })
				}
				$w('#association').options = associationDropdown;
				$w('#association').enable();
			} else {
				let association = [];
				$w('#association').options = association;
			}
		} )
		.catch( (err) => {
			let errorMsg = err;
		} );
	});

	$w('#association').onChange(() => {
		//console.log($w('#state').value + '	' + $w('#association').value);
		wixData.query('AFLdropDown')
		.eq('stateName',$w('#state').value)
		.limit(1000)
		.ascending("clubName")
		.and(
			wixData.query('AFLdropDown')
			.eq('associationName',$w('#association').value))
		.find()
		.then( (results) => {
			if(results.items.length > 0) {
				let club = [];
				for (let i = 0; i < results.items.length; i++) {
					club.push({ label: results.items[i].clubName, value: results.items[i].clubName })
				}
				//console.log(club);
				$w('#club').options = club;
				$w('#club').enable();
			} else {
				let club = [];
				$w('#club').options = club;
			}
		} )
		.catch( (err) => {
			let errorMsg = err;
		} );
	});

	$w('#save').onClick(() => {
		$w("#dataset1").setFieldValues( 
		{
			"state": $w('#state').value,
			"association": $w('#association').value,
			"club": $w('#club').value,
			"contactName": $w('#contactName').value,
			"contactEmail": $w('#contactEmail').value,
			"contactPhone": $w('#contactPhone').value,
			"url": $w('#urlClub').value,
			"checkbox": $w('#checkbox').checked
		});
		$w("#dataset1").save().then(() =>{
			$w('#text94').expand();
			wixLocation.to('/thank-you-page');
		});
	});
});

export function getState(){
	wixData.query("State")
	.ascending("title")
	.find()
	.then((results) => {
		let state2 = [];
		for (let i = 0; i < results.items.length; i++) {
			state2.push({ label: results.items[i].title, value: results.items[i].title })
		}
		$w('#state').options = state2;
	});
}

export function getArray(results){
	let array = [];
	for (let i = 0; i < results.items.length; i++) {
		if(array.includes(results.items[i].associationName)){
			//nothing
		}else{
			array.push(results.items[i].associationName)
		}
	}
	return array;
}