import wixData from 'wix-data';

$w.onReady(function () {
    // Multistate for views//
    $w("#button24").onClick(() => {
        $w('#multiViews').changeState("ViewHome");
    });
    $w("#button23").onClick(() => {
        $w('#multiViews').changeState("View360");
    });
    $w("#closebtn1").onClick(() => {
        $w('#multiViews').changeState("Initial");
    });
    $w("#closebtn2").onClick(() => {
        $w('#multiViews').changeState("Initial");
    });

    $w('#btWhiteQR').onClick(() => {
        $w('#btWhiteQR').disable();
        $w('#btBlackQR').enable();

        $w('#qrWhite').show();
        $w('#qrBlack').hide();
    });

    $w('#btBlackQR').onClick(() => {
        $w('#btWhiteQR').enable();
        $w('#btBlackQR').disable();

        $w('#qrWhite').hide();
        $w('#qrBlack').show();
    });

    $w('#dataset1').onReady(async () => {
        let item = $w('#dataset1').getCurrentItem();
        console.log(item);
        let arrayMenu = [];
        if (item.menuFeatures) arrayMenu.push({ '_id': "0", "label": "Features", "section": "#box156" })
        if (item.menuControllers) arrayMenu.push({ '_id': "1", "label": "Controllers", "section": "#secTabs" })
        if (item.menuTecnologies) arrayMenu.push({ '_id': "2", "label": "Technologies", "section": "#section35" })
        if (item.menuSpecifications) arrayMenu.push({ '_id': "3", "label": "Tech Specs", "section": "#section36" })
        if (item.menuBrochures) arrayMenu.push({ '_id': "4", "label": "Brochures", "section": "#section32" })
        if (arrayMenu.length > 0) {
            $w('#repMenu').data = arrayMenu;
            $w('#repMenu').onItemReady(($item, itemData) => {
                $item('#btMenu').label = itemData.label;
                $item('#btMenu').onClick(() => $w(itemData.section).scrollTo())
            })
        }

        let arrayFeature = [];
        if (item.keyFeature1) arrayFeature.push({ '_id': "0", "label": item.keyFeature1, "image": item.image1 })
        if (item.keyFeature2) arrayFeature.push({ '_id': "1", "label": item.keyFeature2, "image": item.image2 })
        if (item.keyFeature3) arrayFeature.push({ '_id': "2", "label": item.keyFeature3, "image": item.image3 })
        if (item.keyFeature4) arrayFeature.push({ '_id': "3", "label": item.keyFeature4, "image": item.image4 })
        if (arrayFeature.length > 0) {
            $w('#imgFeature').src = item.image1;
            $w('#imgFeature').alt = item.keyFeature1;
            $w('#imgFeature').tooltip = item.keyFeature1;

            $w('#repFeature').data = arrayFeature;
            $w('#repFeature').onItemReady(($item, itemData, index) => {
                $item('#btFeature').label = itemData.label;
                $item('#btFeature').onClick(() => {
                    $w('#imgFeature').src = itemData.image;
                    $w('#imgFeature').alt = itemData.label;
                    $w('#imgFeature').tooltip = itemData.label;
                    $w('#repFeature').forEachItem(($item2, itemData2, index2) => {
                        if (itemData._id == itemData2._id) $item2('#btFeature').disable();
                        else $item2('#btFeature').enable();
                    })
                })
            })
        } else $w('#secFeature').collapse();

        let arrayTabs = [];
        if (item.controller1) arrayTabs.push({ '_id': "0", "label": item.controller1, "state": "tabOne" })
        if (item.controller2) arrayTabs.push({ '_id': "1", "label": item.controller2, "state": "tabTwo" })
        await applyFilter(item._id);
        if (arrayTabs.length > 0) {
            let variable = true;
            $w('#repTabs').data = arrayTabs;
            $w('#repTabs').onItemReady(($item, itemData, index) => {
                if (index == 0 && variable) variable = false, $item('#btTab').disable();
                $item('#btTab').label = itemData.label;
                $item('#btTab').onClick(() => {
                    $w('#multiTabs').changeState(itemData.state);
                    $w('#repTabs').forEachItem(($item2, itemData2, index2) => {
                        if (itemData._id == itemData2._id) $item2('#btTab').disable();
                        else $item2('#btTab').enable();
                    })
                })
            })
        } else $w('#secTabs').collapse();

    });

    // Multistate for tabs//
    $w("#buttonTab1").onClick(() => {
        $w('#multiStateBox3').changeState("tab1");
    });
    $w("#buttonTab2").onClick(() => {
        $w('#multiStateBox3').changeState("tab2");
    });
    $w("#buttonTab3").onClick(() => {
        $w('#multiStateBox3').changeState("tab3");
    });
    $w("#buttonTab4").onClick(() => {
        $w('#multiStateBox3').changeState("tab4");
    });
});

function applyFilter(id) {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().hasSome("SplitSystemAirConditioning", [id]));
    $w('#dataControlerOne').setFilter(filter);

    let filter2 = wixData.filter();
    filter2 = filter2.and(wixData.filter().hasSome("SplitSystemAirConditioning-1", [id]));
    $w('#dataControlerTwo').setFilter(filter2);
}