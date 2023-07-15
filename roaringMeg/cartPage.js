// Para obtener la documentación completa sobre las funciones API, incluidos ejemplos para programa con código, visita http://wix.to/94BuAAs
import wixData from 'wix-data';
import { cart } from 'wix-stores';
import wixWindow from 'wix-window';

var datesFree, checkNormal;
$w.onReady(async function () {
    await getDate();
    await getCartPage();

    cart.onChange(async (changedCart) => {
        await getCartPage();
    });
});

async function getDate() {
    // TODO: write your page related code here...
    var firstDate;
    var columnName;
    var options = {
        "suppressAuth": true
    };

    await wixData.query("2024ProductionDates").limit(1000).ascending("weeks").find()
        .then((results) => {
            datesFree = results.items;
        });

    for (var m = 0; m < datesFree.length; m++) {
        if (datesFree[m].l === '' || typeof datesFree[m].l === 'undefined') {
            //console.log("encontre undefined en l");
            firstDate = datesFree[m];
            columnName = "l";
            break;
        }
        if (datesFree[m].m === '' || typeof datesFree[m].m === 'undefined') {
            //console.log("encontre undefined en m");
            firstDate = datesFree[m];
            columnName = "m";
            break;
        }
        if (datesFree[m].x === '' || typeof datesFree[m].x === 'undefined') {
            //console.log("encontre undefined en x");
            firstDate = datesFree[m];
            columnName = "x";
            break;
        }
        if (datesFree[m].j === '' || typeof datesFree[m].j === 'undefined') {
            //console.log("encontre undefined en j");
            firstDate = datesFree[m];
            columnName = "j";
            break;
        }
        if (datesFree[m].v === '' || typeof datesFree[m].v === 'undefined') {
            //console.log("encontre undefined en v");
            firstDate = datesFree[m];
            columnName = "v";
            break;
        }
        if (datesFree[m].s === '' || typeof datesFree[m].s === 'undefined') {
            //console.log("encontre undefined en s");
            firstDate = datesFree[m];
            columnName = "s";
            break;
        }
        if (datesFree[m].d === '' || typeof datesFree[m].d === 'undefined') {
            //console.log("encontre undefined en d");
            firstDate = datesFree[m];
            columnName = "d";
            break;
        }
    }
    //console.log("first date", firstDate.title);
    $w("#textNextDate").text = firstDate.title;
    $w('#check').label = "I accept next production date " + firstDate.title
    $w("#shoppingCart1").hide();
    $w('#check').onChange(() => {
        if ($w('#check').checked) {
            checkNormal = true
            $w("#shoppingCart1").show();
            if (wixWindow.formFactor !== "Mobile") $w('#group1').expand()

        } else {
            checkNormal = false
            $w("#shoppingCart1").hide();
            if (wixWindow.formFactor !== "Mobile") $w('#group1').collapse()
        }
    })
}

function getCartPage() {
    cart.getCurrentCart()
        .then((currentCart) => {
            let normal = false
            let newProduct = false
            //console.log(currentCart)
            if (currentCart.lineItems.length > 0) {
                for (let i = 0; i < currentCart.lineItems.length; i++) {
                    if (newProduct == false && (currentCart.lineItems[i].sku.includes('PIT'))) newProduct = true;
                    else if (normal == false && (currentCart.lineItems[i].sku == "")) normal = true;
                }

                //console.log("normal", normal)
                //console.log("newProduct", newProduct)

                if (normal) {
                    $w('#text49').expand();
                    $w('#textNextDate').expand();
                    $w('#image19').expand();
                    $w('#check').expand();
                    if (checkNormal) {
                        if (wixWindow.formFactor !== "Mobile") $w('#group1').expand();
                    }

                } else {
                    $w('#text49').collapse();
                    $w('#textNextDate').collapse();
                    $w('#image19').collapse();
                    $w('#check').collapse();
                    if (wixWindow.formFactor !== "Mobile") $w('#group1').collapse();
                }

                if (newProduct) {
                    $w('#GmNew').expand();
                    $w('#image20').expand();
                    if (normal == false || checkNormal == true) {
                        $w("#shoppingCart1").show()
                        if (wixWindow.formFactor !== "Mobile") $w('#group1').expand();
                    }
                } else {
                    $w('#GmNew').collapse();
                    $w('#image20').collapse();
                    if (normal == false || checkNormal == false) {
                        $w("#shoppingCart1").hide()
                        if (wixWindow.formFactor !== "Mobile") $w('#group1').collapse();
                    }
                }
            } else {
                $w('#text49').collapse();
                $w('#textNextDate').collapse();
                $w('#image19').collapse();
                $w('#check').collapse();

                $w('#GmNew').collapse();
                $w('#image20').collapse();
                if(wixWindow.formFactor !== "Mobile") $w('#group1').collapse();

                $w('#shoppingCart1').show();
            }
        }).catch((error) => console.error(error));
}