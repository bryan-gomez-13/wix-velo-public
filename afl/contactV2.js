import wixData from 'wix-data';
import wixLocation from 'wix-location';

var association = [];
var array = [];

$w.onReady(async function () {
	$w('#association').disable();
	getState();

	$w('#state').onChange(async () => {
		$w('#association').disable();
		let results = await wixData.query('AFLdropDown').contains('stateName',$w('#state').value).limit(1000).ascending("associationName").find().then();
		dropDownAssociation(results,association,array);
		while(results.hasNext()) {
			results = await results.next();
			dropDownAssociation(results,association,array);
		}
		$w('#association').enable();
		$w('#association').options = association;
		$w('#association').updateValidityIndication();
		association = [];
		array = [];
	});

	$w('#submitButton').onClick(() => handleSubmit());
	
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

export function dropDownAssociation(results,association,array){
	if(results.items.length > 0) {
		array = getArray(results, array);
		for (let i = 0; i < array.length; i++) {
			association.push({ label: array[i], value: array[i] })
		}
	}
}

export function getArray(results, array){
	for (let i = 0; i < results.items.length; i++) {
		if(array.includes(results.items[i].associationName) == false){
			array.push(results.items[i].associationName)
		}
	}
	return array;
}

//submit
function setInputValidations() {
	$w('#state').required = true;
	$w('#association').required = true;
    $w('#clubInput').required = true;
	$w('#contactName').required = true;
	$w('#contactEmail').required = true;
    $w('#contactPhone').required = true;
    $w('#urlClub').required = true;
	$w('#checkbox').required = true;
}

function handleSubmit() {

    setInputValidations();
    if (isValidForm()) {
		let state = $w('#state').value;
		let association = $w('#association').value;
        let club = $w('#clubInput').value;
		let contactName = $w('#contactName').value;
		let contactEmail = $w('#contactEmail').value;
        let contactPhone = $w('#contactPhone').value;
        let url = $w('#urlClub').value;
		let checkbox = $w('#checkbox').checked;
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
    const result = $w('#state').valid && $w('#association').valid && $w('#clubInput').valid && $w('#contactName').valid && $w('#contactEmail').valid && $w('#contactPhone').valid && $w('#urlClub').valid && $w('#checkbox').valid;
    return result;
}