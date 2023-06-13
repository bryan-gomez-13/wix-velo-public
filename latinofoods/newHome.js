import wixData from 'wix-data';
import wixWindow from 'wix-window';
var size = 25;

$w.onReady(function () {
    dataset();
    repeaters();
});

function repeaters() {
    if (wixWindow.formFactor == "Mobile") {
        // ============================================================================= BS1 =============================================================================
        $w('#bsG3').collapse();
        $w('#onG3').collapse();
        $w('#bscG3').collapse();

        $w('#bsRep1').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#bsName1').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#bsName1').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#bgGPrice1').hide(), $w('#bsDiscountPrice1').text = itemData.formattedPrice
            else $item('#bgGPrice1').show()

            if (itemData.inStock) $item('#bsInStock1').text = "In Stock", $item('#bsAdd1').enable();
            else $item('#bsInStock1').text = "Out of Stock", $item('#bsAdd1').disable();
        })
        // BSC1
        $w('#repBSCol1').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#bsColName1').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#bsColName1').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#bgColGPrice1').hide(), $w('#bsColDiscountPrice1').text = itemData.formattedPrice
            else $item('#bgColGPrice1').show()

            if (itemData.inStock) $item('#bsColInStock1').text = "In Stock", $item('#bsColAdd1').enable();
            else $item('#bsColInStock1').text = "Out of Stock", $item('#bsColAdd1').disable();
        })

        $w('#repBSMex1').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#bsMexName1').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#bsMexName1').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#bgMexGPrice1').hide(), $w('#bsMexDiscountPrice1').text = itemData.formattedPrice
            else $item('#bgMexGPrice1').show()

            if (itemData.inStock) $item('#bsMexInStock1').text = "In Stock", $item('#bsMexAdd1').enable();
            else $item('#bsMexInStock1').text = "Out of Stock", $item('#bsMexAdd1').disable();
        })
        // On sale
        $w('#onRep1').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#onName1').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#onName1').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#onGPrice1').hide(), $w('#onDiscountPrice1').text = itemData.formattedPrice
            else $item('#onGPrice1').show()

            if (itemData.inStock) $item('#onInStock1').text = "In Stock", $item('#onAdd1').enable();
            else $item('#onInStock1').text = "Out of Stock", $item('#onAdd1').disable();
        })

    } else {
        // ============================================================================= BS3 =============================================================================
        $w('#bsG1').collapse();
        $w('#onG1').collapse();
        $w('#bscG1').collapse();

        $w('#bsRep3').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#bsName3').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#bsName3').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#bgGPrice3').hide(), $item('#bsDiscountPrice3').text = itemData.formattedPrice
            else $item('#bgGPrice3').show()

            if (itemData.inStock) $item('#bsInStock3').text = "In Stock", $item('#bsAdd3').enable();
            else $item('#bsInStock3').text = "Out of Stock", $item('#bsAdd3').disable();
        })
        // BsC3

        $w('#repBSCol3').onItemReady(($item, itemData, index) => {
            console.log(itemData)
            if (itemData.name.length > size) {
                $item('#bsColName3').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#bsColName3').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#bgColGPrice3').hide(), $w('#bsColDiscountPrice3').text = itemData.formattedPrice
            else $item('#bgColGPrice3').show()

            if (itemData.inStock) $item('#bsColInStock3').text = "In Stock", $item('#bsColAdd3').enable();
            else $item('#bsColInStock3').text = "Out of Stock", $item('#bsColAdd3').disable();
        })

        $w('#repBSMex3').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#bsMexName3').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#bsMexName3').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#bgMexGPrice3').hide(), $w('#bsMexDiscountPrice3').text = itemData.formattedPrice
            else $item('#bgMexGPrice3').show()

            if (itemData.inStock) $item('#bsMexInStock3').text = "In Stock", $item('#bsMexAdd3').enable();
            else $item('#bsMexInStock3').text = "Out of Stock", $item('#bsMexAdd3').disable();
        })
        // On sale
        $w('#onRep3').onItemReady(($item, itemData, index) => {
            //console.log(itemData)
            if (itemData.name.length > size) {
                $item('#onName3').text = `${itemData.name.substr(0, size)}...`;
            } else {
                $item('#onName3').text = itemData.name;
            }

            if (itemData.discount.type == "NONE") $item('#onGPrice3').hide(), $item('#onDiscountPrice3').text = itemData.formattedPrice
            else $item('#onGPrice3').show()

            if (itemData.inStock) $item('#onInStock3').text = "In Stock", $item('#onAdd3').enable();
            else $item('#onInStock3').text = "Out of Stock", $item('#onAdd3').disable();
        })
    }

}

function dataset() {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("collections", "7c1ed1c6-49b8-e8c0-3ffc-08c2cc9b175d").or(wixData.filter().eq("collections", "dbe66979-21f2-2d47-265c-1cf51f90f11c")));
    $w("#dataset6").setFilter(filter);
    $w("#dataset7").setFilter(filter);
}