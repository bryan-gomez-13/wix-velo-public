import { session } from 'wix-storage';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
// launch 553bfc97-8015-441c-a72a-2f61b09b6cca
// yacht 52a22af0-e352-4284-9120-184b4d8bee53 
var boatCheck = "";

$w.onReady(function () {
    $w('#yacht').onClick(() => filt("yacht"));
    $w('#imgYacht').onClick(() => filt("yacht"));
    $w('#launch').onClick(() => filt("launch"));
    $w('#imgLaunch').onClick(() => filt("launch"));

    $w('#dynamicDataset').onReady(() => $w('#group1').expand())
})

function filt(boat) {
    let filter = wixData.filter();
    if (boat == boatCheck) {
        boatCheck = "";
        $w("#yacht").style.backgroundColor = "#0BAED3";
        $w("#yacht").style.color = "#FFFFFF";
        $w("#box5").style.backgroundColor = "#FFFFFF";

        $w("#launch").style.backgroundColor = "#0BAED3";
        $w("#launch").style.color = "#FFFFFF";
        $w("#box6").style.backgroundColor = "#FFFFFF";
    } else if (boat == "yacht") {
        boatCheck = boat;
        $w("#yacht").style.backgroundColor = "#FFFFFF";
        $w("#yacht").style.color = "#0BAED3";
        $w("#box5").style.backgroundColor = "#0BAED3";

        $w("#launch").style.backgroundColor = "#0BAED3";
        $w("#launch").style.color = "#FFFFFF";
        $w("#box6").style.backgroundColor = "#FFFFFF";

        filter = filter.and(wixData.filter().eq("type", '52a22af0-e352-4284-9120-184b4d8bee53'));
    } else if (boat == "launch") {
        boatCheck = boat;
        $w("#yacht").style.backgroundColor = "#0BAED3";
        $w("#yacht").style.color = "#FFFFFF";
        $w("#box5").style.backgroundColor = "#FFFFFF";

        $w("#launch").style.backgroundColor = "#FFFFFF";
        $w("#launch").style.color = "#0BAED3";
        $w("#box6").style.backgroundColor = "#0BAED3";

        filter = filter.or(wixData.filter().eq("type", '553bfc97-8015-441c-a72a-2f61b09b6cca'));
    }

    $w('#dynamicDataset').setFilter(filter);
}

export function contact(event) {
    let $item = $w.at(event.context);
    let clickedItemData = $item("#dynamicDataset").getCurrentItem();
    session.setItem("code", clickedItemData.boatCode);
    wixLocation.to("/contact");
}