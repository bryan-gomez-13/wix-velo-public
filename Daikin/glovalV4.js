import wixData from "wix-data";
import wixLocation from "wix-location";

import {
    createRecordsWrapper,
} from "backend/salesforce.jsw";
var path
$w.onReady(function () {
    initMenu2();
    initMenuRepeaters2();
    init();
    getURL();
});

function init() {
    $w("#submit").onClick(() => checkRequest());
}

// ============================================ MENU ============================================
async function initMenu2() {
    let MenuData = [];
    await wixData
        .query("Menu")
        .eq("visible", true)
        .isNotEmpty("title")
        .ascending("order")
        .find()
        .then(async (results) => {
            let menu = results.items;
            for (let i = 0; i < menu.length; i++) {
                let json = {
                    _id: menu[i]["_id"],
                    title: menu[i]["title"],
                    image: menu[i]["image"],
                    link: menu[i]["link"],
                };
                if (menu[i]["imageTitle"]) json.imageTitle = menu[i]["imageTitle"]
                if (menu[i]["imageParagraph"]) json.imageParagraph = menu[i]["imageParagraph"]
                json.menuItems = await wixData
                    .query("Menu2")
                    .eq("menu", json._id)
                    .and(wixData.query("Menu2").eq("visible", true))
                    .ascending("order")
                    .find()
                    .then(async (results) => {
                        return results.items;
                    });
                MenuData.push(json);
            }
            return results.items;
        })
        .catch((err) => console.log(err));

    //console.log(MenuData)
    $w("#mainMenuRepeater").data = MenuData;
    $w("#mainMenuRepeater").expand();

    //*** Close Dropdown Menu ***//
    $w("#menuMainWrapper").onMouseOut(() => {
        closeDropdownMenu();
    });
}

function initMenuRepeaters2() {
    const mainMenuRepeater = $w("#mainMenuRepeater");
    const firstLevelMenuRepeater = $w("#firstLevelRepeater");
    const secondLevelMenuRepeater = $w("#secondLevelRepeater");
    const thirdLevelMenuRepeater = $w("#thirdLevelRepeater");

    mainMenuRepeater.data = [];
    firstLevelMenuRepeater.data = [];
    secondLevelMenuRepeater.data = [];
    thirdLevelMenuRepeater.data = [];

    mainMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#mainMenuRepItemBtn");
        mainMenuBtn.label = itemData.title;
        if (itemData.link == path) mainMenuBtn.style.color = "#0097E0";
        mainMenuBtn.onClick(() => wixLocation.to(itemData.link));

        mainMenuBtn.onMouseIn(async () => {
            if (itemData.imageTitle) $w('#imageTitleTxT').text = itemData.imageTitle, $w('#imageBTLink').link = itemData.link;
            if (itemData.imageParagraph) $w('#imageParagraphTxT').text = itemData.imageParagraph;

            if (itemData.menuItems) {
                let firstLvl = await firstLvlF(itemData._id)
                firstLevelMenuRepeater.data = firstLvl; // Settings the next level repeater data
                secondLevelMenuRepeater.data = [];
                thirdLevelMenuRepeater.data = [];
                openDropdownMenu();
            } else {
                closeDropdownMenu();
            }
            if (itemData.image) {
                $w("#mainImage").src = itemData.image; // Settings the relevant image
            }
            activMainMenuBtn(itemData._id);
        });
    });

    firstLevelMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#firstLevelRepBtn");
        mainMenuBtn.label = itemData.title;
        if (itemData.link == path) mainMenuBtn.style.color = "#0097E0";
        mainMenuBtn.onClick(() => wixLocation.to(itemData.link));

        mainMenuBtn.onMouseIn(async () => {
            if (itemData.imageTitle) $w('#imageTitleTxT').text = itemData.imageTitle, $w('#imageBTLink').link = itemData.link;
            if (itemData.imageParagraph) $w('#imageParagraphTxT').text = itemData.imageParagraph;

            let secondLvl = await secondLvlF(itemData._id)
            secondLevelMenuRepeater.data = secondLvl; // Settings the next level repeater data
            thirdLevelMenuRepeater.data = [];

            if (itemData.image) {
                $w("#mainImage").src = itemData.image; // Settings the relevant image
            }
            activFirstLevelRepMenuBtn(itemData._id);
        });
    });

    secondLevelMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#secondLevelRepBtn");
        mainMenuBtn.label = itemData.title;
        if (itemData.link == path) mainMenuBtn.style.color = "#0097E0";
        mainMenuBtn.onClick(() => wixLocation.to(itemData.link));

        mainMenuBtn.onMouseIn(async () => {
            if (itemData.imageTitle) $w('#imageTitleTxT').text = itemData.imageTitle, $w('#imageBTLink').link = itemData.link;
            if (itemData.imageParagraph) $w('#imageParagraphTxT').text = itemData.imageParagraph;

            let ThirtLvl = await ThirtLvlF(itemData._id)

            thirdLevelMenuRepeater.data = ThirtLvl; // Settings the next level repeater data
            if (itemData.image) {
                $w("#mainImage").src = itemData.image; // Settings the relevant image
            }
            activSecondLevelRepMenuBtn(itemData._id);
        });
    });

    thirdLevelMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#thirdLevelRepBtn");
        mainMenuBtn.label = itemData.title;
        if (itemData.link == path) mainMenuBtn.style.color = "#0097E0";
        mainMenuBtn.onClick(() => wixLocation.to(itemData.link));

        mainMenuBtn.onMouseIn(() => {
            if (itemData.imageTitle) $w('#imageTitleTxT').text = itemData.imageTitle, $w('#imageBTLink').link = itemData.link;
            if (itemData.imageParagraph) $w('#imageParagraphTxT').text = itemData.imageParagraph;

            if (itemData.image) {
                $w("#mainImage").src = itemData.image; // Settings the relevant image
            }
            activThirdLevelRepMenuBtn(itemData._id);
        });
    });
}

async function firstLvlF(itemData) {
    let firstLvl = await wixData
        .query("Menu2")
        .eq("menu", itemData)
        .and(wixData.query("Menu2").eq("visible", true))
        .ascending("order")
        .find()
        .then(async (results) => {
            let menu2 = results.items;
            if (menu2.length > 0) {
                let items2 = [];
                for (let j = 0; j < menu2.length; j++) {
                    let json = {
                        _id: menu2[j]["_id"],
                        title: menu2[j]["title"],
                        image: menu2[j]["image"],
                        link: menu2[j]["link"],
                    };
                    if (menu2[j]["imageTitle"]) json.imageTitle = menu2[j]["imageTitle"]
                    if (menu2[j]["imageParagraph"]) json.imageParagraph = menu2[j]["imageParagraph"]
                    items2.push(json);
                }
                return items2;
            } else return [];
        });
    return firstLvl
}

async function secondLvlF(itemData) {
    let secondLvl = await wixData
        .query("Menu3")
        .eq("menu2", itemData)
        .and(wixData.query("Menu3").eq("visible", true))
        .ascending("order")
        .find()
        .then(async (results) => {
            let menu3 = results.items;
            if (menu3.length > 0) {
                let items3 = [];
                for (let k = 0; k < menu3.length; k++) {
                    let json = {
                        _id: menu3[k]["_id"],
                        title: menu3[k]["title"],
                        image: menu3[k]["image"],
                        link: menu3[k]["link"],
                    };
                    if (menu3[k]["imageTitle"]) json.imageTitle = menu3[k]["imageTitle"]
                    if (menu3[k]["imageParagraph"]) json.imageParagraph = menu3[k]["imageParagraph"]
                    items3.push(json);
                }
                return items3;
            } else return [];
        });
    return secondLvl
}

async function ThirtLvlF(itemData) {
    let ThirtLvl = await wixData
        .query("Menu4")
        .eq("menu3", itemData)
        .and(wixData.query("Menu4").eq("visible", true))
        .ascending("order")
        .find()
        .then(async (results) => {
            let menu4 = results.items;
            if (menu4.length > 0) {
                let items3 = [];
                for (let l = 0; l < menu4.length; l++) {
                    let json = {
                        _id: menu4[l]["_id"],
                        title: menu4[l]["title"],
                        image: menu4[l]["image"],
                        link: menu4[l]["link"],
                    };
                    items3.push(json);
                }
                return items3;
            } else return [];
        });
    return ThirtLvl
}

// ============================================ Custom Class List  ============================================
async function openDropdownMenu() {
    $w("#subMenuContainer").customClassList.add("dropdown-menu-expand");
}

async function closeDropdownMenu() {
    $w("#subMenuContainer").customClassList.remove("dropdown-menu-expand");
}

// ============================================ Styling ============================================
function activMainMenuBtn(hoveredBtnId) {
    $w("#mainMenuRepeater").forEachItem(($item, itemData, index) => {
        const mainMenuItem = $item("#mainMenuRepItemBtn");

        if (itemData._id === hoveredBtnId) {
            mainMenuItem.style.color = "#0097E0";
        } else {
            mainMenuItem.style.color = "#00000000";
        }
    });
}

// ============================================ Style ============================================

function activFirstLevelRepMenuBtn(hoveredBtnId) {
    $w("#firstLevelRepeater").forEachItem(($item, itemData, index) => {
        const mainMenuItem = $item("#firstLevelRepBtn");

        if (itemData._id === hoveredBtnId) {
            mainMenuItem.style.color = "#0097E0";
        } else {
            mainMenuItem.style.color = "#00000000"; //Transparent
        }
    });
}

function activSecondLevelRepMenuBtn(hoveredBtnId) {
    $w("#secondLevelRepeater").forEachItem(($item, itemData, index) => {
        const mainMenuItem = $item("#secondLevelRepBtn");

        if (itemData._id === hoveredBtnId) {
            mainMenuItem.style.color = "#0097E0";
        } else {
            mainMenuItem.style.color = "#00000000"; //Transparent
        }
    });
}

function activThirdLevelRepMenuBtn(hoveredBtnId) {
    $w("#thirdLevelRepeater").forEachItem(($item, itemData, index) => {
        const mainMenuItem = $item("#thirdLevelRepBtn");

        if (itemData._id === hoveredBtnId) {
            mainMenuItem.style.color = "#0097E0";
        } else {
            mainMenuItem.style.color = "#00000000"; //Transparent
        }
    });
}

// =================================== Code for url
async function getURL() {
    let baseUrl = wixLocation.baseUrl;
    let url = wixLocation.url;
    path = url.replace(baseUrl, '')
    /*
    let lvl1 = {};
    let lvl2 = {};
    let lvl3 = {};
    let lvl4 = {};

    await wixData.query('Menu4').eq('link', path).find().then((result) => {
        if (result.items.length > 0) lvl4 = result.items[0];
    })

    if (lvl4 !== "") {
        await wixData.query('Menu3').eq('_id', lvl4.menu3).find().then((result) => {
            if (result.items.length > 0) lvl3 = result.items[0];
        })
        await wixData.query('Menu2').eq('_id', lvl3.menu2).find().then((result) => {
            if (result.items.length > 0) lvl2 = result.items[0];
        })
        await wixData.query('Menu').eq('_id', lvl2.menu).find().then((result) => {
            if (result.items.length > 0) lvl1 = result.items[0];
        })

    } else {
        await wixData.query('Menu3').eq('link', path).find().then((result) => {
            if (result.items.length > 0) lvl3 = result.items[0];
        })
        if (lvl3 !== "") {
            await wixData.query('Menu2').eq('_id', lvl3.menu2).find().then((result) => {
                if (result.items.length > 0) lvl2 = result.items[0];
            })
            await wixData.query('Menu').eq('_id', lvl2.menu).find().then((result) => {
                if (result.items.length > 0) lvl1 = result.items[0];
            })
        } else {
            await wixData.query('Menu2').eq('link', path).find().then((result) => {
                if (result.items.length > 0) lvl2 = result.items[0];
            })
            if (lvl2 !== "") {
                await wixData.query('Menu').eq('_id', lvl2.menu).find().then((result) => {
                    if (result.items.length > 0) lvl1 = result.items[0];
                })
                open2(lvl1, lvl2)
            } else {
                await wixData.query('Menu').eq('link', path).find().then((result) => {
                    if (result.items.length > 0) lvl1 = result.items[0];
                })
                activMainMenuBtn(lvl1._id)
            }
        }
    }
    */
}

async function open2(lvl1, lvl2) {
    activMainMenuBtn(lvl1._id);
    let dataLvl2 = await secondLvlF(lvl2.menu);
    $w("#secondLevelRepeater").data = dataLvl2;
    openDropdownMenu();
}

// ============================================ Save Request ============================================
async function checkRequest() {
    $w("#msgText").collapse();
    $w("#submit").disable();

    try {
        check();
        createRecord();
    } catch (Error) {
        console.log(Error);
        $w("#loading").collapse();
        $w("#msgText").text = Error.message;
        $w("#msgText").expand();
        $w("#submit").enable();
    }
}

function check() {
    if (!$w("#firstName").valid) throw new Error("Missing First Name");
    if (!$w("#lastName").valid) throw new Error("Missing Last Name");
    if (!$w("#phoneR").valid) throw new Error("Missing Phone Number");
    if (!$w("#emailR").valid) throw new Error("Missing Email");
    if (!$w("#streetAddress").valid) throw new Error("Missing Street Address");
    if (!$w("#suburb").valid) throw new Error("Missing Suburb");
    if (!$w("#postcode").valid) throw new Error("Missing Postcode");
    if (!$w("#state").valid) throw new Error("Missing State");
    if (!$w("#installation").valid)
        throw new Error("Missing Describe your installation");
    if (!$w("#comments").valid) throw new Error("Missing Message");
    if (!($w("#captcha").token !== undefined))
        throw new Error("CAPTCHA authorization failed.");
}

async function createRecord() {
    if (!$w("#msgText").collapsed) {
        closeMsgBox();
    }
    $w("#loading").expand();
    const FirstName = $w("#firstName").value;
    const LastName = $w("#lastName").value;
    const Phone = $w("#phoneR").value;
    const Email = $w("#emailR").value;
    const Street = $w("#streetAddress").value;
    const City = $w("#suburb").value;
    const PostalCode = $w("#postcode").value;
    const StateCode = $w("#state").value;
    const InstallationType__c = $w("#installation").value;
    const Comments__c = $w("#comments").value;
    const CountryCode = "AU";
    const LeadSource = "Web";
    const Status = "WebLeadCreated";
    const RecordTypeId = "012900000012NnOAAU";
    try {
        const res = await createRecordsWrapper({
            FirstName,
            LastName,
            Phone,
            Email,
            Street,
            City,
            PostalCode,
            StateCode,
            InstallationType__c,
            Comments__c,
            CountryCode,
            LeadSource,
            Status,
            RecordTypeId,
        }, $w('#check').checked);
        console.log(res);
        clearFields();
        if (res) {
            showExecutionMsg("Your record was added.");
        } else {
            showExecutionMsg("Error: Your record was not added.");
        }
    } catch (err) {
        showExecutionMsg(err.toString());
    }
    $w("#loading").collapse();
}

function showExecutionMsg(msg) {
    $w("#msgText").text = msg;
    $w("#msgText").expand();
}

function closeMsgBox() {
    $w("#msgText").collapse();
    $w("#loading").collapse();
}

function clearFields() {
    $w("#firstName").value = "";
    $w("#lastName").value = "";
    $w("#phoneR").value = "";
    $w("#emailR").value = "";
    $w("#streetAddress").value = "";
    $w("#suburb").value = "";
    $w("#postcode").value = "";
    $w("#state").value = "";
    $w("#installation").value = "";
    $w("#comments").value = "";

    $w("#firstName").resetValidityIndication();
    $w("#lastName").resetValidityIndication();
    $w("#phoneR").resetValidityIndication();
    $w("#emailR").resetValidityIndication();
    $w("#streetAddress").resetValidityIndication();
    $w("#suburb").resetValidityIndication();
    $w("#postcode").resetValidityIndication();
    $w("#state").resetValidityIndication();
    $w("#installation").resetValidityIndication();
    $w("#comments").resetValidityIndication();
}