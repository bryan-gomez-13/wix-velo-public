import wixLocation from 'wix-location';
import wixData from 'wix-data';
let keywordsArray = {};

$w.onReady(function () {
 
});

export function bLeft_click(event) {
	keywordsArray.dexterity = "Left Handed";
	changeSlide(1);
}

export function bRight_click(event) {
	keywordsArray.dexterity = "Right Handed";
	changeSlide(1);
}

export async function iCollection_click(event) {
	console.log(event);
	keywordsArray.collection = event.context.itemId;
    $w('#statebox').changeState('sleep');
    await $w("#datasetModels").setFilter(wixData.filter().eq("collection", keywordsArray.collection));
    changeSlide(2);
}

export function iModel_click(event) {
	console.log(event);
    keywordsArray.model = event.context.itemId;
    changeSlide(3);
}

export async function bBlack_click(event) {
	keywordsArray.finish = "Black";
    $w('#statebox').changeState('sleep');
    await $w("#datasetHosel").setFilter(wixData.filter().eq("collection", keywordsArray.collection).eq("model", keywordsArray.model).eq("finish", keywordsArray.finish).eq("dexterity", keywordsArray.dexterity));
    changeSlide(4);
}

export async function bNickel_click(event) {
	keywordsArray.finish = "Nickel";
    $w('#statebox').changeState('sleep');
    await $w("#datasetHosel").setFilter(wixData.filter().eq("collection", keywordsArray.collection).eq("model", keywordsArray.model).eq("finish", keywordsArray.finish).eq("dexterity", keywordsArray.dexterity));
    changeSlide(4);
}

export function iHosel_click(event) {
	$w('#statebox').changeState('sleep');
    console.log(event);
    keywordsArray.hosel = event.context.itemId;
    console.log("keywordsArray", keywordsArray);
    wixData.query("Putters").eq("dexterity", keywordsArray.dexterity).eq("collection", keywordsArray.collection).eq("model", keywordsArray.model).eq("finish", keywordsArray.finish).eq("hosel", keywordsArray.hosel).find()
        .then(res => {
            console.log(res);
            wixLocation.to(res.items[0]["link-putters-title"]);
        })
        .catch(err => {
            console.log(err);
        })
}

async function changeSlide(index) {
    if (index === 1) {
        if (keywordsArray.dexterity === "Left Handed") {
            $w('#rCollection').forEachItem(($item, itemData, i) => {
                $item("#iCollection").src = itemData.collectionLH;
            });
        } else {
            $w('#rCollection').forEachItem(($item, itemData, i) => {
                $item("#iCollection").src = itemData.image;
            });
        }
    }
    if (index === 2) {
        if (keywordsArray.dexterity === "Left Handed") {
            $w("#rModels").forEachItem(($item, itemData, i) => {
                $item("#iModel").src = itemData.imageLH;
            });

        } else {
            $w("#rModels").forEachItem(($item, itemData, i) => {
                $item("#iModel").src = itemData.image;
            });
        }
    }
    console.log(index);
	$w('#statebox').changeState(index.toString());
    $w("#statebox").scrollTo();
}

export function bCollection_click(event) {
	$w('#statebox').changeState('0');
    console.log(event);
}
export function bModel_click(event) {
	$w('#statebox').changeState('1');
}
export function bFinish_click(event) {
	$w('#statebox').changeState('2');
}
export function bHosel_click(event) {
	$w('#statebox').changeState('3');
}