//Geolocation
import wixWindow from 'wix-window';
import { geoLocation } from 'backend/code.jsw'
import { session } from 'wix-storage';

$w.onReady(function () {
    wixWindow.getCurrentGeolocation()
        .then(async (obj) => {
            console.log(obj)
            console.log(obj.coords.latitude, obj.coords.longitude)
            $w("#maps").location = {
                "latitude": obj.coords.latitude,
                "longitude": obj.coords.longitude,
                "description": "My Location"
            };
            let address = await geoLocation(obj.coords.latitude, obj.coords.longitude);
            console.log(address)
            $w('#addressText').text = address.results[0].formatted_address
            $w("#section2").expand();
            //$w("#addressText").expand();
            session.setItem("address", address.results[0].formatted_address);
        })
        .catch((error) => {
            console.log(error);
        });
});