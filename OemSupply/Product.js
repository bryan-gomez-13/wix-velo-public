import wixLocation from 'wix-location';
import { memory } from 'wix-storage';

$w.onReady(function () {
	//console.log($w('#dynamicDataset').getCurrentItem())
    $w('#text12').onClick(() => contact())
});

function contact() {
    memory.setItem("product", $w('#dynamicDataset').getCurrentItem().code);
	wixLocation.to("/contact-us");
}