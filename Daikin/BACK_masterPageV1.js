import wixLocation from "wix-location";
import wixWindowFrontend from 'wix-window-frontend';
import wixSiteFrontend from 'wix-site-frontend';
import wixLocationFrontend from 'wix-location-frontend';
import { saveFAQinfo, getMenuInfoWixData } from 'backend/collections.jsw'
import { createRecordsWrapper, } from "backend/salesforce.jsw";

var path, activateDesign = true;
// Buttons
// Class button principal menu
var classPrincipalMenu = "classHover"

// Class when the page is the same like the button
var classBtUrl = "classBtUrl";

// Class when the mouse is in first lvl hover and when you are in the lvl 3 but have principal item in lvl 1
var classHoverButTheMouseNotThere = "classHoverButTheMouseNotThere";

// Arrow
// Class when the arrow is show because there are more elements in the next lvl
var classShowArrow = "classShowArrow";
// Class hide arrow
var classHideArrow = "classHideArrow";

//Menu
// Class to expand menu
var expandMenu = "dropdown-menu-expand"

// Mobile Variables
var menuL = 1,
    lastChange = "";
var mainMenu, menu2, menu3, menu4;

$w.onReady(async function () {
    await getURL();
    await getMainMenuInfo();
    init();

    //console.log($w('#expandableMenu1').menuItems)
});

function init() {
    if ($w('#submit').isVisible) $w("#submit").onClick(() => checkRequest());
    if ($w('#button123').isVisible) {
        let json = {
            'title': wixSiteFrontend.currentPage.name,
            'link': wixLocationFrontend.url
        }
        //BT Yes
        $w('#button123').onClick(async () => {
            json.helpful = 'Yes';
            await saveFAQinfo(json);
        })
        // BT No
        $w('#button124').onClick(async () => {
            json.helpful = 'No';
            await saveFAQinfo(json);
        })
    }

    // Mobile
    $w('#boxMenuMobile').onViewportEnter(() => {
        $w('#btOpenSearchMobile').onClick(() => {
            $w('#box253').hide();
            $w('#boxSearch').show();
        })

        $w('#backMain').onClick(() => { $w('#mmMobile').changeState('mainMenuMob'), lastChange = "firstMenuLvlMob", menuL = 2 });
        $w('#backFirst').onClick(() => { $w('#mmMobile').changeState('firstMenuLvlMob'), lastChange = "secondtMenuLvlMob", menuL = 3 });
        $w('#backThird').onClick(() => { $w('#mmMobile').changeState('secondtMenuLvlMob'), lastChange = "thirdMenuLvlMob", menuL = 4 });

        updateMenuMobile();
    })

    // Desktop
    $w('#boxMenuMobile').onViewportLeave(() => {
        $w('#btOpenSearchMobile').onClick(() => {
            $w('#box253').hide();
            $w('#boxSearch').show();
        })

        desktopMenu();
    })

    $w('#btOpenSearch').onClick(() => {
        $w('#box253').hide();
        $w('#boxSearch').show();
    })

    $w('#btCloseSearch').onClick(() => {
        $w('#boxSearch').hide();
        $w('#box253').show();
    })
}
// ============================================ MENU ============================================
async function getMainMenuInfo() {
    [mainMenu, menu2, menu3, menu4] = await Promise.all([
        getMenuInfoWixData('Menu'),
        getMenuInfoWixData('Menu2'),
        getMenuInfoWixData('Menu3'),
        getMenuInfoWixData('Menu4')
    ]);

    if (wixWindowFrontend.formFactor !== "Desktop") updateMenuMobile();
    else desktopMenu();
}

function updateMenuMobile(itemData) {
    let menuData, menuFilter, repId, titleId, moreInfoId, filterD;

    switch (menuL) {
    case 1:
        //console.log(1);
        menuL = 2;
        // Info
        menuData = mainMenu;
        menuFilter = menu2;
        // Ids
        repId = "#mainMenuMobItems";
        titleId = "#mainMenuMobItemTitle";
        moreInfoId = "#mainMenuMobItemMoreInfo";
        filterD = "menu";

        $w('#mmMobile').changeState('mainMenuMob');
        break;
    case 2:
        //console.log(2);
        $w('#firstTxt').text = itemData.title;
        menuL = 3;
        menuData = menu2.filter((item) => item.menu === itemData._id);
        menuFilter = menu3;
        // Ids
        repId = "#firstMenuMobItems";
        titleId = "#firstMenuMobItemTitle";
        moreInfoId = "#firstMenuMobItemMoreInfo";
        filterD = "menu2";

        $w('#mmMobile').changeState('firstMenuLvlMob');
        lastChange = "mainMenuMob"
        break;
    case 3:
        //console.log(3);
        $w('#secondTxt').text = itemData.title;
        menuL = 4;
        menuData = menu3.filter((item) => item.menu2 === itemData._id);
        menuFilter = menu4;
        // Ids
        repId = "#secondMenuMobItems";
        titleId = "#secondMenuMobItemTitle";
        moreInfoId = "#secondMenuMobItemMoreInfo";
        filterD = "menu3";

        $w('#mmMobile').changeState('secondtMenuLvlMob');
        lastChange = "firstMenuLvlMob"
        break;
    case 4:
        //console.log(4);
        $w('#thirdTxt').text = itemData.title;
        menuData = menu4.filter((item) => item.menu3 === itemData._id);
        menuFilter = menu4;
        // Ids
        repId = "#thirdMenuMobItems";
        titleId = "#thirdMenuMobItemTitle";
        moreInfoId = "#thirdMenuMobItemMoreInfo";
        filterD = "menu4";

        $w('#mmMobile').changeState('thirdMenuLvlMob');
        lastChange = "secondtMenuLvlMob"
        break;
    }

    let mainMenuMobRepeater = $w(repId);

    if (menuData.length == 0) $w('#mmMobile').changeState(lastChange);

    mainMenuMobRepeater.data = menuData;
    mainMenuMobRepeater.onItemReady(($item, itemData) => {
        let mainMenuMobTitle = $item(titleId);
        let mainMenuMobMoreInfo = $item(moreInfoId);

        mainMenuMobTitle.label = itemData.title;
        mainMenuMobTitle.link = itemData.link;

        let itemsTitle = menuFilter.filter((item) => item[filterD] === itemData._id);

        if (itemsTitle.length > 0) mainMenuMobMoreInfo.expand();
        else mainMenuMobMoreInfo.collapse();

        mainMenuMobMoreInfo.onClick(() => {
            updateMenuMobile(itemData);
        })
    });
}

async function desktopMenu() {
    // console.log(mainMenu, menu2, menu3, menu4)
    const mainMenuRepeater = $w("#mainMenuRepeater");
    const firstLevelMenuRepeater = $w("#firstLevelRepeater");
    const secondLevelMenuRepeater = $w("#secondLevelRepeater");
    const thirdLevelMenuRepeater = $w("#thirdLevelRepeater");

    // Main Menu
    mainMenuRepeater.data = mainMenu;
    mainMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#mainMenuRepItemBtn");
        mainMenuBtn.label = itemData.title;
        mainMenuBtn.link = itemData.link;

        // Url same like the button
        if (itemData.link == path) mainMenuBtn.customClassList.add(classBtUrl);
        else mainMenuBtn.customClassList.remove(classBtUrl);

        mainMenuBtn.onMouseIn(() => {
            //Menu2
            let menu2Main = menu2.filter((item) => item.menu === itemData._id);
            if (menu2Main.length > 0) {
                firstLevelMenuRepeater.data = menu2Main;
                //Menu3
                let menu3Main = menu3.filter((item) => item.menu2 === menu2Main[0]._id);
                // Design Button
                if (activateDesign) activFirstLevelRepMenuBtn(menu2Main[0]._id, menu3Main.length);

                if (menu3Main.length > 0) {
                    secondLevelMenuRepeater.data = menu3Main;
                    //Menu4
                    let menu4Main = menu4.filter((item) => item.menu3 === menu3Main[0]._id);
                    // Design Button
                    if (activateDesign) activSecondLevelRepMenuBtn(menu3Main[0]._id, menu4Main.length);
                    if (menu4Main.length > 0) {
                        thirdLevelMenuRepeater.data = menu4Main;
                    } else thirdLevelMenuRepeater.data = [];
                } else secondLevelMenuRepeater.data = [], thirdLevelMenuRepeater.data = [];
                //Image - title - description
                if (itemData.image) $w("#mainImage").src = itemData.image, $w("#mainImage").expand(); // Settings the relevant image
                //else $w('#mainImage').collapse();
                if (itemData.imageTitle) $w("#imageTitleTxT").text = itemData.imageTitle, $w("#imageTitleTxT").expand(); // Settings the relevant image
                //else $w('#imageTitleTxT').collapse();
                if (itemData.imageParagraph) $w("#imageParagraphTxT").text = itemData.imageParagraph, $w("#imageParagraphTxT").expand(); // Settings the relevant image
                //else $w('#imageParagraphTxT').collapse();
                if (itemData.imageUrl) $w("#imageBTLink").link = itemData.imageUrl, $w("#imageBTLink").expand();
                //else $w('#imageBTLink').collapse();
                openDropdownMenu();
            } else closeDropdownMenu();
            // Design Button
            if (activateDesign) activMainMenuBtn(itemData._id);
        })
    });

    mainMenuRepeater.expand();
    // Menu2
    firstLevelMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#firstLevelRepBtn");
        mainMenuBtn.label = itemData.title;
        mainMenuBtn.link = itemData.link;

        // Url same like the button
        if (itemData.link == path) mainMenuBtn.customClassList.add(classBtUrl);
        else mainMenuBtn.customClassList.remove(classBtUrl);

        mainMenuBtn.onMouseIn(() => {
            //Menu3
            let menu3Main = menu3.filter((item) => item.menu2 === itemData._id);
            // Design Button
            if (activateDesign) activFirstLevelRepMenuBtn(itemData._id, menu3Main.length);

            if (menu3Main.length > 0) {
                secondLevelMenuRepeater.data = menu3Main;
                //Menu4
                let menu4Main = menu4.filter((item) => item.menu3 === menu3Main[0]._id);
                // Design Button
                if (activateDesign) activSecondLevelRepMenuBtn(menu3Main[0]._id, menu4Main.length);
                if (menu4Main.length > 0) {
                    thirdLevelMenuRepeater.data = menu4Main;
                } else thirdLevelMenuRepeater.data = [];
            } else secondLevelMenuRepeater.data = [], thirdLevelMenuRepeater.data = [];

            //Image - title - description
            if (itemData.image) $w("#mainImage").src = itemData.image, $w("#mainImage").expand();
            //else $w('#mainImage').collapse();
            if (itemData.imageTitle) $w("#imageTitleTxT").text = itemData.imageTitle, $w("#imageTitleTxT").expand();
            //else $w('#imageTitleTxT').collapse();
            if (itemData.imageParagraph) $w("#imageParagraphTxT").text = itemData.imageParagraph, $w("#imageParagraphTxT").expand();
            //else $w('#imageParagraphTxT').collapse();
            if (itemData.imageUrl) $w("#imageBTLink").link = itemData.imageUrl, $w("#imageBTLink").expand();
            //else $w('#imageBTLink').collapse();
        })
    });
    // Menu 3
    secondLevelMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#secondLevelRepBtn");
        mainMenuBtn.label = itemData.title;
        mainMenuBtn.link = itemData.link;

        // Url same like the button
        if (itemData.link == path) mainMenuBtn.customClassList.add(classBtUrl);
        else mainMenuBtn.customClassList.remove(classBtUrl);

        mainMenuBtn.onMouseIn(() => {
            //Menu4
            let menu4Main = menu4.filter((item) => item.menu3 === itemData._id);
            // Design Button
            if (activateDesign) activSecondLevelRepMenuBtn(itemData._id, menu4Main.length);
            if (menu4Main.length > 0) {
                thirdLevelMenuRepeater.data = menu4Main;
            } else thirdLevelMenuRepeater.data = [];

            //Image - title - description
            if (itemData.image) $w("#mainImage").src = itemData.image, $w("#mainImage").expand();
            //else $w('#mainImage').collapse();
            if (itemData.imageTitle) $w("#imageTitleTxT").text = itemData.imageTitle, $w("#imageTitleTxT").expand();
            //else $w('#imageTitleTxT').collapse();
            if (itemData.imageParagraph) $w("#imageParagraphTxT").text = itemData.imageParagraph, $w("#imageParagraphTxT").expand();
            //else $w('#imageParagraphTxT').collapse();
            if (itemData.imageUrl) $w("#imageBTLink").link = itemData.imageUrl, $w("#imageBTLink").expand();
            //else $w('#imageBTLink').collapse();
        })
    });
    // Menu 4
    thirdLevelMenuRepeater.onItemReady(($item, itemData) => {
        const mainMenuBtn = $item("#thirdLevelRepBtn");
        mainMenuBtn.label = itemData.title;
        mainMenuBtn.link = itemData.link;

        // Url same like the button
        if (itemData.link == path) mainMenuBtn.customClassList.add(classBtUrl);
        else mainMenuBtn.customClassList.remove(classBtUrl);

        // if (itemData.title == "Alira X") mainMenuBtn.customClassList.add(classBtUrl);
        // else mainMenuBtn.customClassList.remove(classBtUrl);

        mainMenuBtn.onMouseIn(() => {
            //Image - title - description
            if (itemData.image) $w("#mainImage").src = itemData.image, $w("#mainImage").expand();
            //else $w('#mainImage').collapse();
            if (itemData.imageTitle) $w("#imageTitleTxT").text = itemData.imageTitle, $w("#imageTitleTxT").expand();
            //else $w('#imageTitleTxT').collapse();
            if (itemData.imageParagraph) $w("#imageParagraphTxT").text = itemData.imageParagraph, $w("#imageParagraphTxT").expand();
            //else $w('#imageParagraphTxT').collapse();
            if (itemData.imageUrl) $w("#imageBTLink").link = itemData.imageUrl, $w("#imageBTLink").expand();
            //else $w('#imageBTLink').collapse();
        })
    });
    // Wrapper
    $w("#menuMainWrapper").onMouseOut(() => closeDropdownMenu());
}

// ============================================ Get Url ============================================
async function getURL() {
    let baseUrl = wixLocation.baseUrl;
    let url = wixLocation.url;
    path = url.replace(baseUrl, '')
}

// ============================================ Custom Class List  ============================================
async function openDropdownMenu() {
    $w("#subMenuContainer").customClassList.add(expandMenu);
}

async function closeDropdownMenu() {
    $w("#subMenuContainer").customClassList.remove(expandMenu);
    activMainMenuBtn("");
}

// ============================================ Styling ============================================
function activMainMenuBtn(hoveredBtnId) {
    $w("#mainMenuRepeater").forEachItem(($item, itemData) => {
        const mainMenuItem = $item("#mainMenuRepItemBtn");
        if (itemData._id === hoveredBtnId) mainMenuItem.customClassList.add(classPrincipalMenu);
        else mainMenuItem.customClassList.remove(classPrincipalMenu);
    });
}

function activFirstLevelRepMenuBtn(hoveredBtnId, length) {
    $w("#firstLevelRepeater").forEachItem(($item, itemData, index) => {
        const mainMenuItem = $item("#firstLevelRepBtn");
        const mainArrowItem = $item("#firstLevelArrow");

        if (itemData._id === hoveredBtnId) {
            mainMenuItem.customClassList.add(classHoverButTheMouseNotThere);
            if (length > 0) {
                mainArrowItem.customClassList.remove(classHideArrow);
                mainArrowItem.customClassList.add(classShowArrow);
            } else {
                mainArrowItem.customClassList.remove(classShowArrow);
                mainArrowItem.customClassList.add(classHideArrow);
            }
        } else {
            mainMenuItem.customClassList.remove(classHoverButTheMouseNotThere);

            mainArrowItem.customClassList.remove(classShowArrow);
            mainArrowItem.customClassList.add(classHideArrow);
        }
    });
}

function activSecondLevelRepMenuBtn(hoveredBtnId, length) {
    $w("#secondLevelRepeater").forEachItem(($item, itemData, index) => {
        const mainMenuItem = $item("#secondLevelRepBtn");
        const mainArrowItem = $item("#secondLevelArrow");

        if (itemData._id === hoveredBtnId) {
            mainMenuItem.customClassList.add(classHoverButTheMouseNotThere);
            if (length > 0) {
                mainArrowItem.customClassList.remove(classHideArrow);
                mainArrowItem.customClassList.add(classShowArrow);
            } else {
                mainArrowItem.customClassList.remove(classShowArrow);
                mainArrowItem.customClassList.add(classHideArrow);
            }
        } else {
            mainMenuItem.customClassList.remove(classHoverButTheMouseNotThere);

            mainArrowItem.customClassList.remove(classShowArrow);
            mainArrowItem.customClassList.remove(classHideArrow);
            mainArrowItem.customClassList.add(classHideArrow);
        }
    });
}

// ============================================ SALESFORCE ============================================
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