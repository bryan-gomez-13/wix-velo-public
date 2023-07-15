import wixData from 'wix-data';
import wixWindow from 'wix-window';
var size = 25;

$w.onReady(function () {
    dataClearance();
    repeters();
    init();
});

function init() {
    wixData.query('CountryCodes').ascending('title').find().then((results) => {
        let items = results.items
        //console.log(items)
        $w('#repFilter').data = items
        $w('#repFilter').onItemReady(($item, itemData, index) => {
            $item('#btCountry').label = itemData.title;
            $item('#btCountry').onClick(async () => {
                await filterCountry(itemData.id)
                $w('#repFilter').onItemReady(($item2, itemData2, index) => {
                    if (itemData._id == itemData2._id) $item2('#btCountry').disable()
                    else $item2('#btCountry').enable()
                })
            })
        })
    }).catch((err) => console.log(err))
}

function repeters() {
    if (wixWindow.formFactor == "Mobile") {
        // ============================================================= MOBILE =============================================================
        $w('#h').collapse();
        $w('#bsG').collapse();
        $w('#onG').collapse();
        $w('#bscG').collapse();

        // ============================================================= Products Home
        $w('#dataHM').onReady(() => {
            $w('#repHM').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.discount.type == "NONE") $item('#group37').hide(), $item('#mhPrice').text = itemData.formattedPrice
                else $item('#group37').show();
            })
        })

        // ============================================================= Best Seller M
        $w('#bsmDATA').onReady(() => {
            $w('#repmBS').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.name.length > size) {
                    $item('#bsmName').text = `${itemData.name.substr(0, size)}...`;
                } else {
                    $item('#bsmName').text = itemData.name;
                }

                if (itemData.discount.type == "NONE") $item('#bgmGPrice').hide(), $item('#bsmDiscountPrice').text = itemData.formattedPrice
                else $item('#bgmGPrice').show()

                if (itemData.inStock) $item('#bsmInStock').text = "In Stock", $item('#bsmAdd').enable();
                else $item('#bsmInStock').text = "Out of Stock", $item('#bsmAdd').disable();

            })
        })
        // ============================================================= On sale and Clearance M
        $w('#onmDATA').onReady(() => {
            $w('#repmON').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.name.length > size) {
                    $item('#onmName').text = `${itemData.name.substr(0, size)}...`;
                } else {
                    $item('#onmName').text = itemData.name;
                }

                if (itemData.discount.type == "NONE") $item('#onmGPrice').hide(), $item('#onmDiscountPrice').text = itemData.formattedPrice
                else $item('#onmGPrice').show()

                if (itemData.inStock) $item('#onmInStock').text = "In Stock", $item('#onmAdd').enable();
                else $item('#onmInStock').text = "Out of Stock", $item('#onmAdd').disable();

            })
        })
        // ============================================================= Best Seller Country M
        $w('#bscmDATA').onReady(() => {
            $w('#repBSCM').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.name.length > size) {
                    $item('#bscmName').text = `${itemData.name.substr(0, size)}...`;
                } else {
                    $item('#bscmName').text = itemData.name;
                }

                if (itemData.discount.type == "NONE") $item('#bscmPrice').hide(), $item('#bscmDiscountPrice').text = itemData.formattedPrice
                else $item('#bscmPrice').show()

                if (itemData.inStock) $item('#bscmInStock').text = "In Stock", $item('#bscmAdd').enable();
                else $item('#bscmInStock').text = "Out of Stock", $item('#bscmAdd').disable();

            })
        })

    } else {
        // ============================================================= DESKTOP =============================================================
        $w('#hm').collapse();
        $w('#bsmG').collapse();
        $w('#onmG').collapse();
        $w('#bscmG').collapse();

        // ============================================================= Products Home
        $w('#dataH').onReady(() => {
            $w('#repH').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.discount.type == "NONE") $item('#group35').hide(), $item('#hPrice').text = itemData.formattedPrice
                else $item('#group35').show();
            })
        })

        // ============================================================= Best Seller 
        $w('#bsDATA').onReady(() => {
            $w('#repBS').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.name.length > size) {
                    $item('#bsName').text = `${itemData.name.substr(0, size)}...`;
                } else {
                    $item('#bsName').text = itemData.name;
                }

                if (itemData.discount.type == "NONE") $item('#bgGPrice').hide(), $item('#bsDiscountPrice').text = itemData.formattedPrice
                else $item('#bgGPrice').show()

                if (itemData.inStock) $item('#bsInStock').text = "In Stock", $item('#bsAdd').enable();
                else $item('#bsInStock').text = "Out of Stock", $item('#bsAdd').disable();

            })
        })
        // ============================================================= On sale and Clearance
        $w('#onDATA').onReady(() => {
            $w('#repON').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.name.length > size) {
                    $item('#onName').text = `${itemData.name.substr(0, size)}...`;
                } else {
                    $item('#onName').text = itemData.name;
                }

                if (itemData.discount.type == "NONE") $item('#onGPrice').hide(), $item('#onDiscountPrice').text = itemData.formattedPrice
                else $item('#onGPrice').show()

                if (itemData.inStock) $item('#onInStock').text = "In Stock", $item('#onAdd').enable();
                else $item('#onInStock').text = "Out of Stock", $item('#onAdd').disable();

            })
        })
        // ============================================================= Best Seller Country
        $w('#bscDATA').onReady(() => {
            $w('#repBSC').onItemReady(($item, itemData, index) => {
                //console.log(itemData)
                if (itemData.name.length > size) {
                    $item('#bscName').text = `${itemData.name.substr(0, size)}...`;
                } else {
                    $item('#bscName').text = itemData.name;
                }

                if (itemData.discount.type == "NONE") $item('#bscPrice').hide(), $item('#bscDiscountPrice').text = itemData.formattedPrice
                else $item('#bscPrice').show()

                if (itemData.inStock) $item('#bscInStock').text = "In Stock", $item('#bscAdd').enable();
                else $item('#bscInStock').text = "Out of Stock", $item('#bscAdd').disable();

            })
        })

    }
}

function dataClearance() {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("collections", "7c1ed1c6-49b8-e8c0-3ffc-08c2cc9b175d").or(wixData.filter().eq("collections", "dbe66979-21f2-2d47-265c-1cf51f90f11c")));
    //filter = filter.and(wixData.filter().eq("inStock", true));
    $w("#onDATA").setFilter(filter);
    $w("#onmDATA").setFilter(filter);
}

function filterCountry(id) {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("collections", id));
    //filter = filter.and(wixData.filter().eq("inStock", true));
    $w("#bscDATA").setFilter(filter);
    $w("#bscmDATA").setFilter(filter);
}