import {getInfo} from 'backend/ClubRamen'

$w.onReady(function () {
	$w('#shippingAddress').onChange(() => shippingA());
});

async function shippingA() {
	try {
		let lat = $w('#shippingAddress').value.location.latitude;
		let lon = $w('#shippingAddress').value.location.longitude
		let request = await getInfo(lat,lon)
		if(request.services[0].nonUrban == false && request.services[0].sameDayZone == "AKL") $w('#message').collapse(), $w('#shoppingCart1').expand();
		else $w('#shoppingCart1').collapse(), $w('#message').text = 'Whoops. We don’t offer delivery to your area just yet.', $w('#message').expand();
	} catch (error) {
		$w('#message').text = 'Fill in the shipping address';
		$w('#message').expand();
	}
}