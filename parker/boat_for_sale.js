import {session} from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
 
});

export function button1_click(event) {
	let $item = $w.at(event.context);
    let clickedItemData = $item("#dynamicDataset").getCurrentItem();
    session.setItem("code", clickedItemData.boatcode);
    wixLocation.to("/contact");
}