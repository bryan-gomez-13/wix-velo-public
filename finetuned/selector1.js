import wixLocation from 'wix-location';
import wixData from 'wix-data';

let putter = {};
let keywordsArray = {};

$w.onReady(function () {
    changeSlide(0);

});

//====================================
export function buttonLeft_click(event) {
    putter.dexterity = "Left Handed";
    changeSlide(1);
}

export function bLeft_click(event) {
	keywordsArray.dexterity = "Left Handed";
	changeSlide(1);
}

export function buttonRight_click(event) {
    putter.dexterity = "Right Handed";
    changeSlide(1);
}
export function bRight_click(event) {
	keywordsArray.dexterity = "Right Handed";
	changeSlide(1);
}

//====================================

export async function imageCollection_click(event) {
    let $item = $w.at(event.context);
    console.log(event);
    putter.collection = event.context.itemId;
    await $w("#datasetModels").setFilter(wixData.filter().eq("collection", putter.collection));
    changeSlide(2);
}

export async function iCollection_click(event) {
	console.log(event);
	keywordsArray.collection = event.context.itemId;
    $w('#statebox').changeState('sleep');
    await $w("#datasetModels").setFilter(wixData.filter().eq("collection", keywordsArray.collection));
    changeSlide(2);
}

//====================================

export async function imageModel_click(event) {
    let $item = $w.at(event.context);
    console.log(event);
    putter.model = event.context.itemId;
    changeSlide(3);
}

export function iModel_click(event) {
	console.log(event);
    keywordsArray.model = event.context.itemId;
    changeSlide(3);
}
//==================================
export async function buttonBlack_click(event) {
    putter.finish = "Black";
    await $w("#datasetHosel").setFilter(wixData.filter().eq("collection", putter.collection).eq("model", putter.model).eq("finish", putter.finish).eq("dexterity", putter.dexterity));
    changeSlide(4);
}
export async function bBlack_click(event) {
	keywordsArray.finish = "Black";
    $w('#statebox').changeState('sleep');
    await $w("#datasetHosel").setFilter(wixData.filter().eq("collection", keywordsArray.collection).eq("model", keywordsArray.model).eq("finish", keywordsArray.finish).eq("dexterity", keywordsArray.dexterity));
    changeSlide(4);
}

export async function buttonNickel_click(event) {
    putter.finish = "Nickel";
    await $w("#datasetHosel").setFilter(wixData.filter().eq("collection", putter.collection).eq("model", putter.model).eq("finish", putter.finish).eq("dexterity", putter.dexterity));
    changeSlide(4);
}
export async function bNickel_click(event) {
	keywordsArray.finish = "Nickel";
    $w('#statebox').changeState('sleep');
    await $w("#datasetHosel").setFilter(wixData.filter().eq("collection", keywordsArray.collection).eq("model", keywordsArray.model).eq("finish", keywordsArray.finish).eq("dexterity", keywordsArray.dexterity));
    changeSlide(4);
}

//==============================================
export function imageHosel_click(event) {
    changeSlide(5);
    let $item = $w.at(event.context);
    console.log(event);
    putter.hosel = event.context.itemId;
    console.log("Putter", putter);
    wixData.query("Putters").eq("dexterity", putter.dexterity).eq("collection", putter.collection).eq("model", putter.model).eq("finish", putter.finish).eq("hosel", putter.hosel).find()
        .then(res => {
            console.log(res);
            wixLocation.to(res.items[0]["link-putters-title"]);
        })
        .catch(err => {
            console.log(err);
        })
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
//==================
function changeSlide(index) {
    if (index === 1) {
        if (putter.dexterity === "Left Handed" || keywordsArray.dexterity === "Left Handed") {
            $w("#repeaterCollection").forEachItem(($item, itemData, i) => {
                $item("#imageCollection").src = itemData.collectionLH;
            });
            $w('#rCollection').forEachItem(($item, itemData, i) => {
                $item("#iCollection").src = itemData.collectionLH;
            });
        } else {
            $w("#repeaterCollection").forEachItem(($item, itemData, i) => {
                $item("#imageCollection").src = itemData.image;
            });
            $w('#rCollection').forEachItem(($item, itemData, i) => {
                $item("#iCollection").src = itemData.image;
            });
        }
    }
    if (index === 2) {
        if (putter.dexterity === "Left Handed" || keywordsArray.dexterity === "Left Handed") {
            $w("#repeaterModels").forEachItem(($item, itemData, i) => {
                $item("#imageModel").src = itemData.imageLH;
            });
            $w("#rModels").forEachItem(($item, itemData, i) => {
                $item("#iModel").src = itemData.imageLH;
            });

        } else {
            $w("#repeaterModels").forEachItem(($item, itemData, i) => {
                $item("#imageModel").src = itemData.image;
            });
            $w("#rModels").forEachItem(($item, itemData, i) => {
                $item("#iModel").src = itemData.image;
            });
        }
    }
    console.log(index);
    $w("#slideshow").changeSlide(index);
	$w('#statebox').changeState(index.toString());
    $w("#slideshow").scrollTo();
    $w("#statebox").scrollTo();
}

export function backCollection_click(event) {
    changeSlide(0);
}

export function bCollection_click(event) {
	$w('#statebox').changeState('0');
    console.log(event);
}
//======
export function backModel_click(event) {
    changeSlide(1);
}
export function bModel_click(event) {
	$w('#statebox').changeState('1');
}
//====
export function backFinish_click(event) {
    changeSlide(2);
}
export function bFinish_click(event) {
	$w('#statebox').changeState('2');
}
//====
export function backHosel_click(event) {
    changeSlide(3);
}
export function bHosel_click(event) {
	$w('#statebox').changeState('3');
}