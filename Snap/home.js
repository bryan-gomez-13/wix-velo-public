import { timeline } from 'wix-animations-frontend';
import { fetchLocationInfo } from 'backend/siteWideFunctions.jsw'
import wixLocationFrontend from 'wix-location-frontend';

let locationInfo 

$w.onReady(async function () {
    // Jaime
    // Cambiar el id text99 por el conjunto de elementos que estaran en el repetidor 
    $w('#dataFAQ').onReady(() => {
        $w('#repFAQ').onItemReady(($item, itemData) => {
            $item('#moreInfo').onClick(() => {
                if ($item('#text99').collapsed) {
                    timeline().add($item('#moreInfo'), { duration: 0, rotate: 180 }).play();
                    $item('#text99').expand();
                } else {
                    timeline().add($item('#moreInfo'), { duration: 0, rotate: 0 }).play();
                    $item('#text99').collapse();
                }
            })
        })
    })

    //set locationInfo
    locationInfo = JSON.parse(await fetchLocationInfo())

    //Set Dates
    let defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() + 1);
    let defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 4);

    $w('#pickUpDate').value = defaultStartDate
    $w('#dropOffDate').value = defaultEndDate

    //set custom validations
    $w('#dropOffDate').onCustomValidation(async (value, reject) => {
        if (await timeValidator() === false) {
            $w('#dropOffTime').validity.valid = false
            $w('#pickUpTime').validity.valid = false
            $w('#dropOffTime').resetValidityIndication()
            $w('#pickUpTime').resetValidityIndication()
            reject('invalid times')
        }
    })

    $w('#dropOffTime').onCustomValidation(async (value, reject) => {
        if (await timeValidator() === false) {
            $w('#dropOffTime').validity.valid = false
            $w('#pickUpTime').validity.valid = false
            $w('#dropOffTime').updateValidityIndication()
            $w('#pickUpTime').resetValidityIndication()
            reject('invalid times')
        }
    })
});


export function locationSelectChange(event) {
    $w('#dropOffLocation').selectedIndex = (event.target.id.includes('pickUp')) ? event.target.selectedIndex : $w('#dropOffLocation').selectedIndex;

    $w('#pickUpTime').enabledTimes = locationInfo[$w('#pickUpLocation').value].hours 
    $w('#dropOffTime').enabledTimes = locationInfo[$w('#dropOffLocation').value].hours 
}

export function pickUpDateChange(event) {
    if (($w("#dropOffDate").value.getTime() - event.target.value.getTime()) < 0) {
        let updatedDate = new Date(event.target.value)
        updatedDate.setDate(updatedDate.getDate() + 3);
    $w("#dropOffDate").value = updatedDate
	}
}


export function mainSearchButton_click(event) {
	let promo = ($w('#promoCode').value) ? $w('#promoCode').value : '';
    let funnelUrl = locationInfo["funnelUrl"]

    wixLocationFrontend.to(funnelUrl + 'PickUpLocation=' + $w('#pickUpLocation').value + '&PickUpDate=' + dateFormat($w('#pickUpDate').value) + '&PickUpTime=' + timeFormat(dateFormat($w('#pickUpDate').value),$w('#pickUpTime').value) + '&DropOffLocation=' + $w('#dropOffLocation').value + '&DropOffDate=' + dateFormat($w('#dropOffDate').value) + '&DropOffTime=' + timeFormat(dateFormat($w('#dropOffDate').value),$w('#dropOffTime').value) + '&Promo=' + promo)

}


export async function timeValidator() {
	if ($w('#dropOffDate').value.getTime() === $w('#pickUpDate').value.getTime() && Number($w('#dropOffTime').value.substring(0,2)) <= Number($w('#pickUpTime').value.substring(0,2))) {
		$w('#mainSearchButton').disable()
        $w('#mainSearchButton').label = "change times";
        return false
                   
	} else {
		$w('#mainSearchButton').enable()
        $w('#mainSearchButton').label = "Find my vehicle"
        $w('#dropOffTime').validity.valid = true
        $w('#dropOffTime').resetValidityIndication()
        return true
	}
}

export function showDropOffOptions(event) {
	if ($w('#dropOffOptionsBox').collapsed) {
        $w('#dropOffOptionsBox').expand()
    }
}

function dateFormat(date) { 
		return date.toLocaleString('en-NZ', { year: 'numeric' })
			+ '-' + date.toLocaleString('en-NZ', { month: '2-digit' })
			+ '-' + date.toLocaleString('en-NZ', { day: '2-digit' })
}

function timeFormat(date, time) { 
		return new Date(date + 'T' + time).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
}



export function vehiclesRepeater_itemReady($item, itemData) {
    let tagsDict = {
        "POPULAR" : "#FF595C",
        "VALUE" : "#418FDE",
        "PREMIUM" : "#7574C1",
        "EFFICIENT" : "#D3D756",
        "7 SEATS" : "#FB7698",
        "4WD" : "#F68D2E"
    }

    itemData.tags.forEach((tagTxt, idx) => {
        $item(`#tagTxt${idx}`).text = tagTxt
        $item(`#tag${idx}`).style.backgroundColor = tagsDict[tagTxt]
        $item(`#tag${idx}`).expand() })
    

}
