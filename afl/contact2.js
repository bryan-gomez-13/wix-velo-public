import wixData from 'wix-data';
import wixLocation from 'wix-location';

const HL_COLOR = '#f0001b'; // highlight color - for makred items
const REG_COLOR = '#023c91'; // regular color - for unmarked items 
const maxListSize = 5;

let listSize; // the number of displayed items in the repeater
let currIndex = -1; // the current index of the selected item
let debounceTimer;

$w.onReady(function () {
	$w('#association2').disable();
	$w('#state2').disable();

	getState();

	$w('#rptDropdown').onItemReady(($item, itemData, index) => {
		itemReadyHandler($item, itemData, index);
		$item("#clubNameText").text = itemData.clubName;
	});
	$w('#clubInput').onKeyPress((event) => keyPressHandler(event.key));
	$w('#clubInput').onFocus(() => keyPressHandler()); // trigger the default case inside the handler 
	$w('#backgroundBox').onClick(() => {
		$w('#rptDropdown').collapse();
		expandGroup();
	});
	$w('#submitButton').onClick(() => handleSubmit());
	/*$w('#state2').onClick(() => {
		updateDropdown();
		console.log($w('#association2').value);
		console.log($w('#state2').value);
	});*/

	$w('#state2').onChange(() => {
		getAssociation();
		updateDropdown();
		console.log($w('#association2').value);
		console.log($w('#state2').value);
	});
});

function keyPressHandler(key) {
	collapGroup();
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }
    debounceTimer = setTimeout(() => { // wrapping the handler with setTimeOut in order to delay the handling to the point the user has finished typing
        if ($w('#clubInput').value.length === 0) {
            currIndex = -1;
            $w('#rptDropdown').collapse();
        } else {

            switch (key) {
            case 'Enter':
                $w('#clubInput').value = $w('#rptDropdown').data[currIndex].clubName;
                $w('#rptDropdown').collapse();
				expandGroup();
                break;
            case 'ArrowUp':
                if (currIndex > 0) {
                    currIndex = currIndex - 1;
                    refreshItemsColors();
                }
                break;
            case 'ArrowDown':
                if (currIndex < listSize - 1) {
                    currIndex = currIndex + 1;
                    refreshItemsColors();
                }
                break;
            case 'Escape':
                $w('#clubInput').value = '';
                currIndex = -1;
                $w('#rptDropdown').collapse();
				expandGroup();
                break;
            default:
                currIndex = -1;
                wixData.query('AFLdropDown')
                    .startsWith('clubName', $w('#clubInput').value)
                    .ascending('clubName')
                    .limit(maxListSize)
                    .find()
                    .then((res) => {
                        if (res.items.length !== 0) {
                            $w('#rptDropdown').data = [];
                            $w('#rptDropdown').data = res.items;
                            listSize = res.items.length;
                            $w('#rptDropdown').expand()
                        } else {
                            $w('#rptDropdown').collapse();
                        }
                    });
                break;
            }
        }
    }, 250);
}

function itemReadyHandler($item, itemData, index) {

    $item('#clubNameText').text = itemData.clubName;

    if (index === currIndex) { // the user has navigated to this item
        $item('#rptBox').style.backgroundColor = HL_COLOR; // highlight this item
    } else {
        $item('#rptBox').style.backgroundColor = REG_COLOR; // use the regular color for all other items
    }

    $item('#container1').onClick(() => {
		console.log("itemData");
		console.log(itemData);
        $w('#clubInput').value = itemData.clubName;
        $w('#rptDropdown').collapse();
		expandGroup();
    });
}

function refreshItemsColors() {
    $w('#rptDropdown').forEachItem(($item, itemData, index) => {
        if (index === currIndex) {
            $item('#rptBox').style.backgroundColor = HL_COLOR;
        } else {
            $item('#rptBox').style.backgroundColor = REG_COLOR;
        }
    });
}

/*export function getState(){
	expandGroup();
	wixData.query('AFLdropDown')
	.eq('clubName',$w('#clubInput').value)
	.limit(1000)
	.ascending("stateName")
	.find()
	.then( (results) => {
		let stateDropdown = [];
		let asssocationDropdown = [];
		if(results.items.length > 0) {
			let state = getArrayState(results);
			let association = getArrayAssociation(results);
			for (let i = 0; i < state.length; i++) {
				stateDropdown.push({ label: state[i], value: state[i] })
			}
			for (let i = 0; i < association.length; i++) {
				asssocationDropdown.push({ label: association[i], value: association[i] })
			}
			$w('#association2').options = asssocationDropdown;
			$w('#state2').options = stateDropdown;
			updateDropdown();
			$w('#association2').enable();
			$w('#state2').enable();
		}else {
			$w('#state2').options = stateDropdown;
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}*/

export function getAssociation(){
	wixData.query('AFLdropDown')
	.eq('clubName',$w('#clubInput').value)
	.and(
		wixData.query('AFLdropDown')
		.eq('stateName',$w('#state2').value))
	.ascending("associationName")
	.find()
	.then( (results) => {
		let asssocationDropdown = [];
		$w('#association2').options = asssocationDropdown;
		if(results.items.length > 0) {
			let state = getArrayAssociation(results);
			for (let i = 0; i < state.length; i++) {
				asssocationDropdown.push({ label: state[i], value: state[i] })
			}
			$w('#association2').options = asssocationDropdown;
			$w('#association2').enable();
		}else {
			$w('#association2').options = asssocationDropdown;
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
	} );
}

/*export function getArrayState(results){
	let array = [];
	for (let i = 0; i < results.items.length; i++) {
		if(array.includes(results.items[i].stateName)){
			//nothing
		}else{
			array.push(results.items[i].stateName)
		}
	}
	return array;
}*/

export function getArrayAssociation(results){
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

export function expandGroup(){
	$w('#box87').expand();
	$w('#state2').enable();
}
export function collapGroup(){
	$w('#box87').collapse();
}

//submit
function setInputValidations() {
    $w('#clubInput').required = true;
    $w('#state2').required = true;
    $w('#association2').required = true;
	$w('#contactName2').required = true;
	$w('#contactEmail2').required = true;
    $w('#contactPhone2').required = true;
    $w('#urlClub2').required = true;
	$w('#checkbox2').required = true;
}

function handleSubmit() {

    setInputValidations();
    if (isValidForm()) {
        let state = $w('#state2').value;
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
    const result = $w('#clubInput').valid && $w('#state2').valid && $w('#association2').valid && $w('#contactName2').valid && $w('#contactPhone2').valid && $w('#urlClub2').valid && $w('#checkbox2').valid;
    return result;
}

export function updateDropdown(){
	$w('#association2').updateValidityIndication();
	//$w('#state2').updateValidityIndication();
}

export function getState(){
	wixData.query("State")
	.ascending("title")
	.find()
	.then((results) => {
		let state2 = [];
		for (let i = 0; i < results.items.length; i++) {
			state2.push({ label: results.items[i].title, value: results.items[i].title })
		}
		$w('#state2').options = state2;
	});
}