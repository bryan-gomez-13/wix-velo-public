import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
	$w('#state2').disable();
	getAssociation();
	$w('#association2').onChange(() => {
		
		wixData.query("StateAndAssociation")
		.eq('associationName',$w('#association2').value)
		.find()
		.then( (results) => {
			if(results.items.length > 1) {
				$w('#state3').hide();
				$w('#state3').text = '';
				let stateDropdown = [];
				let state = getArrayState(results);
				for (let i = 0; i < state.length; i++) {
					stateDropdown.push({ label: state[i], value: state[i] })
				}
				$w('#state2').options = stateDropdown;
				$w('#state2').expand();
				$w('#state2').enable();	
				
			} else if(results.items.length == 1 ){
				$w('#state2').collapse();
				$w('#state3').text = results.items[0].stateName;
				$w('#state3').show();
			}
		})
		.catch( (err) => {
			let errorMsg = err;
		});

	});
	$w('#submitButton').onClick(() => handleSubmit());

	// OTHER FORM ======================================================================================================
	$w('#imageX15').onClick(() => {
		getState2();
		$w('#association').disable();
		$w('#club').disable();
		$w('#box86').expand();

	});

	$w('#imageX15').onDblClick(() => {
		$w('#box86').collapse();
	});

	$w('#state').onChange(() => {
		getAssociation2();
	});

	$w('#association').onChange(() => {
		getClub2();
	});
});

export function getAssociation(){
	wixData.query("StateAndAssociation")
	.ascending("associationName")
	.limit(500)
	.find()
	.then((results) => {
		let state = [];
		for (let i = 0; i < results.items.length; i++) {
			state.push({ label: results.items[i].associationName, value: results.items[i].associationName })
		}
		$w('#association2').options = state;
	});
}

export function getArrayState(results){
	let array = [];
	for (let i = 0; i < results.items.length; i++) {
		if(array.includes(results.items[i].stateName)){
			//nothing
		}else{
			array.push(results.items[i].stateName)
		}
	}
	return array;
}

//submit
function setInputValidations() {
    $w('#clubInput').required = true;
	$w('#contactName2').required = true;
	$w('#contactEmail2').required = true;
    $w('#contactPhone2').required = true;
    $w('#urlClub2').required = true;
	$w('#checkbox2').required = true;
}

function handleSubmit() {

    setInputValidations();
    if (isValidForm()) {
		let state;
		if($w('#state3').text == ''){
			state = $w('#state2').value;
		}else{
			state = $w('#state3').text;
		}
		
		let association = $w('#association2').value;
        let club = $w('#clubInput').value;
		let contactName = $w('#contactName2').value;
		let contactEmail = $w('#contactEmail2').value;
        let contactPhone = $w('#contactPhone2').value;
        let url = $w('#urlClub2').value;
		let checkbox = $w('#checkbox2').checked;
        let toInsert = {
            state,
			association,
			club,
			contactName,
			contactEmail,
			contactPhone,
			url,
			checkbox
        };
        wixData.insert('form', toInsert)
            .then(() => {
                wixLocation.to("/thank-you-page")
            }).catch((error) => {
                console.error(error)
            });
    }
}

function isValidForm() {
    const result = $w('#clubInput').valid && $w('#contactName2').valid && $w('#contactPhone2').valid && $w('#urlClub2').valid && $w('#checkbox2').valid;
    return result;
}

export function updateDropdown(){
	$w('#association2').updateValidityIndication();
	$w('#state2').updateValidityIndication();
}

//=================================================================================================================================
export function getState2(){
	wixData.query("State")
	.ascending("title")
	.find()
	.then((results) => {
		let state = [];
		for (let i = 0; i < results.items.length; i++) {
			state.push({ label: results.items[i].title, value: results.items[i].title })
		}
		$w('#state').options = state;
	});
}

export function getAssociation2(){
	wixData.query('StateAndAssociation')
	.eq('stateName',$w('#state').value)
	.limit(500)
	.ascending("associationName")
	.find()
	.then( (results) => {
		if(results.items.length > 0) {
			let associationDropdown = [];
			for (let i = 0; i < results.items.length; i++) {
				associationDropdown.push({ label: results.items[i].associationName, value: results.items[i].associationName })
			}
			$w('#association').options = associationDropdown;
			$w('#association').enable();
		} else {
			let associationDropdown = [];
			$w('#association').options = associationDropdown;
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

export function getClub2(){
	wixData.query('AFLdropDown')
	.eq('stateName',$w('#state').value)
	.and(
		wixData.query('AFLdropDown')
		.eq('associationName',$w('#association').value)
	)
	.ascending("clubName")
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
}