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

	$w('#state2').onChange(() => {
		getAssociation($w('#state2').value);
		updateDropdown();
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
                getState();
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
        $w('#clubInput').value = itemData.clubName;
        $w('#rptDropdown').collapse();
		expandGroup();
        getState();
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

export function getState(){
	expandGroup();
	wixData.query('AFLdropDown')
	.eq('clubName',$w('#clubInput').value)
	.limit(1000)
	.ascending("stateName")
	.find()
	.then( (results) => {
		let stateDropdown = [];
		if(results.items.length > 1) {
            $w('#state3').hide();
			$w('#state3').text = '';
			$w('#association3').hide();
			let state = getArrayState(results);
			for (let i = 0; i < state.length; i++) {
				stateDropdown.push({ label: state[i], value: state[i] })
			}
			$w('#state2').options = stateDropdown;
			$w('#state2').expand();
            $w('#state2').enable();
			updateDropdown();
		}else if(results.items.length == 1){
			$w('#state2').collapse();
			$w('#state3').text = results.items[0].stateName;
            $w('#state3').show();
            getAssociation($w('#state3').text);
        }else{
			$w('#association2').expand();
			$w('#state2').expand();
			$w('#association2').disable();
			$w('#state2').disable();
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
		console.log(errorMsg);
	} );
}

export function getAssociation(key){
    let query;
    if(key !== ''){
		query = wixData.query('AFLdropDown').eq('stateName',key);
    }else{
        query = wixData.query('AFLdropDown').eq('stateName',$w('#state2').value);
    }
	wixData.query('AFLdropDown')
	.eq('clubName',$w('#clubInput').value)
	.and(query)
	.ascending("associationName")
	.find()
	.then( (results) => {
		let asssocationDropdown = [];
		$w('#association2').options = asssocationDropdown;
		if(results.items.length > 1) {
            $w('#association3').hide();
			$w('#association3').text = '';
			for (let i = 0; i < results.items.length; i++) {
				asssocationDropdown.push({ label: results.items[i].associationName, value: results.items[i].associationName/*state[i]*/ })
			}
			$w('#association2').options = asssocationDropdown;
            updateDropdown();
			$w('#association2').expand();
			$w('#association2').enable();
		}else {
            $w('#association2').collapse();
            $w('#association3').text = results.items[0].associationName;
			$w('#association3').show();
		}
	} )
	.catch( (err) => {
		let errorMsg = err;
		console.log(errorMsg);
	} );
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

export function expandGroup(){
	$w('#box87').expand();
}
export function collapGroup(){
	$w('#box87').collapse();
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
		let association;
		if($w('#association3').text == ''){
			association = $w('#association2').value;
		}else{
			association = $w('#association3').text;
		}

		let state;
		if($w('#state3').text == ''){
			state = $w('#state2').value;
		}else{
			state = $w('#state3').text;
		}

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