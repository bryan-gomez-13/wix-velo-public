import wixLocation from 'wix-location';
$w.onReady(function () {
    TextOrder();
    wixLocation.onChange((location) => {
        TextOrder();
    });
});

export function TextOrder() {
    //console.log(wixLocation.query.locationId)
    switch (wixLocation.query.locationId) {
        //Devonport             Gold
    case "c2ec4b63-62f8-48cb-9a22-d26a5cf331cf":
        //$w('#text1').text = "ORDER ONLINE DEVONPORT";
        $w('#Devonport').expand();
        $w('#Meadowbank').collapse();
        $w('#MaskellStreet').collapse();
        break;
        //Maskell Street        Aquamarine      
    case "bd9c1957-1e9d-4a4d-ac74-95195381d74e":
        //$w('#text1').text = "ORDER ONLINE ST HELIERS";
        $w('#MaskellStreet').expand();
        $w('#Meadowbank').collapse();
        $w('#Devonport').collapse();
        break;
        //Meadowbank            Blue
    case "5972e633-7687-42bc-af9d-c527a8e0e1a6":
        //$w('#text1').text = "ORDER ONLINE MEADOWBANK";
        $w('#Meadowbank').expand();
        $w('#MaskellStreet').collapse();
        $w('#Devonport').collapse();
        break;
    }

}

/*
import wixLocation from 'wix-location';
$w.onReady(function () {
    $w('#Heliers').onClick(() => wixLocation.to('/order-online/?locationId=bd9c1957-1e9d-4a4d-ac74-95195381d74e'));
    $w('#Meadowbank').onClick(() => wixLocation.to('/order-online/?locationId=5972e633-7687-42bc-af9d-c527a8e0e1a6'));
    $w('#Devonport').onClick(() => wixLocation.to('/order-online/?locationId=c2ec4b63-62f8-48cb-9a22-d26a5cf331cf'));
});
*/