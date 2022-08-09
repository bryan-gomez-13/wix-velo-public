import { decrementInventory, getProductVariants, createOrder } from 'backend/inventory';
import wixLocation from 'wix-location';
import wixWindow from 'wix-window';
import wixUsers from 'wix-users';
import wixData from 'wix-data';

var arrayElements = [];
let subtotalText = 0;

$w.onReady(function () {
    $w('#shoppingCartIcon1').collapse();
    init();
    filterProducts();
    slideRange()
    device();
    user();
});

function init() {
    let formFactor = wixWindow.formFactor; // "Mobile"
    if (formFactor !== "Desktop") {
        $w('#mobileButton2').expand();
        $w('#mobileButton2').onClick(() => $w('#filter').expand());
    }
    //MultiStateBox
    $w('#BOrder').onClick(() => Buttons(1));
    $w('#goToCheckout').onClick(() => Buttons(1));
    $w('#continueShopping').onClick(() => Buttons(2));
    $w('#BProducts').onClick(() => Buttons(2));
    $w('#cartPage').onClick(() => Buttons(3));

    //Events
    $w('#Add').onClick((event) => Add(event));
    $w('#quantity').onInput((Event) => quantity(Event));
    $w('#quantityBox').onInput((Event) => quantityBox(Event));
    //Filters
    $w('#searchProduct').onClick(() => filterLatino());
    $w('#filter').onChange(() => filterLatino());
    $w('#range').onChange(() => filterLatino());

    $w('#submit').onClick(() => createOrderLF());
    $w('#addressInput1').onChange(() => zonas());
    $w('#checkbox1').onChange(() => zonas());

    $w('#sort').onChange(() => sortAsDes())

    $w("#repeater1").onItemReady(async ($item, itemData, index) => {
        console.log(itemData)
        if (itemData.inStock == false) {
            $item('#Add').label = 'Out of stock'
            $item('#Add').disable();
        }

        if (itemData.sku) {
            $item('#itemSku').text = itemData.sku
            $item('#dropVariant').collapse();
            wixData.query("WholesalesProducts")
                .eq('sku', itemData.sku)
                .find()
                .then((results) => {
                    if (results.items.length > 0) {
                        $item('#price').text = "" + parseFloat(results.items[0].price);
                        //console.log(results.items[0].name)
                        if (results.items[0].unitPerBox == undefined || results.items[0].unitPerBox == 0) {
                            $item('#quantityBox').disable();
                            $item('#Units').text = results.items[0].unitPerBox;
                        } else {
                            $item('#Units').text = results.items[0].unitPerBox;
                        }
                        if (results.items[0].name != undefined) {
                            $item('#text145').text = results.items[0].name;
                        }
                        $item('#Best').text = results.items[0].expiryDate;
                        $item('#vWeight').text = results.items[0].weight;
                    } else {
                        $item('#price').text = "" + parseFloat(itemData.price);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            let variant = await getVariant(itemData._id);
            console.log(variant)
            let x = []

            for (let index = 0; index < itemData.productOptions.Weight.choices.length; index++) {
                for (let i = 0; i < variant.length; i++) {
                    if (variant[i].stock.inStock && itemData.productOptions.Weight.choices[index].visible && variant[i].choices.Weight == itemData.productOptions.Weight.choices[index].value) x.push({ label: variant[i].choices.Weight, value: variant[i].sku })
                }
            }

            $item('#dropVariant').options = x;
            $item('#dropVariant').expand();
        }

        // DROP VARIANT
        $item('#dropVariant').onChange((event) => {
            //let $item = $w.at(event.context);
            $item('#itemSku').text = $item('#dropVariant').value
            //console.log($item('#dropVariant').value)
            wixData.query("WholesalesProducts")
                .eq('sku', $item('#dropVariant').value)
                .find()
                .then((results) => {
                    console.log(results.items)
                    if (results.items.length > 0) {
                        $item('#price').text = "" + parseFloat(results.items[0].price);
                        //console.log(results.items[0].name)
                        if (results.items[0].unitPerBox == undefined || results.items[0].unitPerBox == 0) {
                            $item('#quantityBox').disable();
                            $item('#Units').text = results.items[0].unitPerBox;
                        } else {
                            $item('#Units').text = results.items[0].unitPerBox;
                        }
                        if (results.items[0].name != undefined) {
                            $item('#text145').text = results.items[0].name;
                        }
                        $item('#Best').text = results.items[0].expiryDate;
                        $item('#vWeight').text = results.items[0].weight;
                        $item('#Add').enable();
                        $item('#text147').show();
                        $item('#price').show();
                        $item('#text150').show();
                        $item('#Units').show();
                        $item('#text153').show();
                        $item('#Best').show();
                        $item('#tWeight').show();
                        $item('#vWeight').show();
                    } else {
                        $item('#price').text = "" + parseFloat(itemData.price);
                        $item('#Add').disable();
                        $item('#text147').hide();
                        $item('#price').hide();
                        $item('#text150').hide();
                        $item('#Units').hide();
                        $item('#text153').hide();
                        $item('#Best').hide();
                        $item('#tWeight').hide();
                        $item('#vWeight').hide();
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });

    });
}
// ===================================================== INFO USERS =====================================================
function user() {
    let user = wixUsers.currentUser;
    user.getEmail()
        .then((email) => {
            let userEmail = email; // "user@something.com"
            wixData.query("contact112")
                .eq('email', userEmail)
                .find()
                .then((results) => {
                    if (results.items.length > 0) {
                        let firstItem = results.items[0]; //see item below
                        $w('#input9').value = firstItem.email;
                        $w('#input10').value = firstItem.phone;
                        $w('#input11').value = firstItem.firstName;
                        $w('#input12').value = firstItem.lastName;
                        $w('#input13').value = firstItem.shortAnswerField;
                        $w('#checkOutHours').value = firstItem.shortAnswerField2;
                        $w('#checkOutComplete').text = firstItem.autocompleteAddress;
                        $w('#checkOutAddress').text = firstItem.shortAnswerField3;
                        $w('#checkoutCity').text = firstItem.shortAnswerField4;
                        $w('#checkOutPostCode').text = firstItem.shortAnswerField5;
                        $w('#checkOutCountry').text = firstItem.shortAnswerField6;
                        //$w('#addressInput1').value = firstItem.autocompleteAddress;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });
}

// ===================================================== DEVICE =====================================================
function device() {
    let formFactor = wixWindow.formFactor; // "Mobile"
    if (formFactor == "Desktop") {
        $w('#filter').expand();
        //$w('#quickActionBar1').collapse()
    } else {
        $w('#filter').collapse();
        $w('#quickActionBar1').collapse()
    }
}

// ===================================================== FILTER =====================================================
function filterProducts() {
    wixData.query("Stores/Collections")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                let filter = []
                for (let i = 0; i < results.items.length; i++) {
                    filter.push({ label: results.items[i].name, value: results.items[i]._id })
                }
                filter.pop();
                $w('#filter').options = filter;
            }
        })
        .catch((err) => {
            console.log(err)
        });
}

async function filterLatino() {
    let filter = wixData.filter();
    //Search filter
    if ($w('#search').value.length > 0) filter = filter.and(wixData.filter().contains('name', $w('#search').value).and(wixData.filter().eq("collections", ["7e56d55b-bfda-7c32-000b-37c175dcca89"])));

    //Collection filter
    if ($w('#filter').value.length == 0) {
        filter = filter.and(wixData.filter().hasSome("collections", ["00000000-000000-000000-000000000001"]).and(wixData.filter().eq("collections", ["7e56d55b-bfda-7c32-000b-37c175dcca89"])))
    } else {
        filter = filter.and(wixData.filter().hasSome("collections", $w('#filter').value).and(wixData.filter().eq("collections", ["7e56d55b-bfda-7c32-000b-37c175dcca89"])))
    }

    //price filter
    let x = [0, $w('#range').max];
    console.log($w('#range').value.toString() !== x.toString(), $w('#range').value.toString(), x.toString())
    if ($w('#range').value.toString() !== x.toString()) {
        filter = filter.and(wixData.filter().gt('price', $w('#range').value[0]))
        filter = filter.and(wixData.filter().le("price", $w('#range').value[1]))
        console.log('ok')
    }

    $w("#dataset1").setFilter(filter);
    sortAsDes();
}

async function slideRange() {
    //getMaxPrice for the range slide
    await wixData.query("Stores/Products")
        .eq("collections", ["7e56d55b-bfda-7c32-000b-37c175dcca89"])
        .descending('price')
        .find()
        .then((results) => {
            $w('#range').max = results.items[0].price
            $w('#range').value = [0, results.items[0].price];
        })
        .catch((err) => { console.log(err); });
}

// Sort by Ascending or Descending
function sortAsDes() {
    switch ($w('#sort').value) {
    case 'A-Z':
        $w("#dataset1").setSort(wixData.sort().ascending("name"))
        break;

    case 'Z-A':
        $w("#dataset1").setSort(wixData.sort().descending("name"))
        break;

    case 'Low - High':
        $w("#dataset1").setSort(wixData.sort().ascending("price"))
        break;

    case 'High - Low':
        $w("#dataset1").setSort(wixData.sort().descending("price"))
        break;

    default:
        $w("#dataset1").setSort(wixData.sort())
        break;
    }
}
// ===================================================== BUTTONS =====================================================
function Buttons(key) {
    switch (key) {
    case 1:
        $w('#Box').changeState('Pay');
        $w('#BOrder').disable();
        $w('#cartPage').enable();
        $w('#BProducts').enable();
        break;

    case 2:
        $w('#Box').changeState('Products');
        $w('#BProducts').disable();
        $w('#cartPage').enable();
        $w('#BOrder').enable();
        break;

    case 3:
        $w('#Box').changeState('CartPage');
        $w('#cartPage').disable();
        $w('#BProducts').enable();
        $w('#BOrder').enable();
        break;
    }
}

// ===================================================== QUANTITY & SEARCH =====================================================
async function quantity(params) {
    let $item = $w.at(params.context);
    let clickedItemData = $item("#dataset1").getCurrentItem();
    await xero($item);
    let total = 0;
    if ($item('#Units').text == 'Units') total = parseFloat($item("#quantity").value);
    else total = (parseFloat($item('#Units').text) * parseFloat($item('#quantityBox').value)) + parseFloat($item("#quantity").value);
    $item('#totalUnits').text = "" + total;

    if (clickedItemData.sku) {
        if (total > parseFloat(clickedItemData.quantityInStock)) {
            $item('#quantity').value = clickedItemData.quantityInStock;
            $item('#totalUnits').text = "" + clickedItemData.quantityInStock;
            $item('#quantityBox').value = "1";
            $item('#text5').text = clickedItemData.quantityInStock + " units in stock"
            $item('#text5').expand();
            setTimeout(() => $item('#text5').collapse(), 5000);
        }
    } else {
        let variant = await getVariant(clickedItemData._id);
        let variantInStock = 0;
        for (let i = 0; i < variant.length; i++) {
            if (variant[i].sku == $item('#itemSku').text) {
                variantInStock = variant[i].stock.quantity
                break
            }
        }
        if (total > parseFloat(variantInStock)) {
            $item('#quantity').value = "" + variantInStock;
            $item('#totalUnits').text = "" + variantInStock;
            $item('#quantityBox').value = "1";
            $item('#text5').text = variantInStock + " units in stock"
            $item('#text5').expand();
            setTimeout(() => $item('#text5').collapse(), 5000);
        }
    }

}

async function quantityBox(params) {
    let $item = $w.at(params.context);
    let clickedItemData = $item("#dataset1").getCurrentItem();
    await xero($item);
    let total = (parseFloat($item('#Units').text) * parseFloat($item('#quantityBox').value)) + parseFloat($item("#quantity").value);
    $item('#totalUnits').text = "" + total;

    if (clickedItemData.sku) {
        if (total > parseFloat(clickedItemData.quantityInStock)) {
            $item('#quantity').value = clickedItemData.quantityInStock;
            $item('#totalUnits').text = "" + clickedItemData.quantityInStock;
            $item('#quantityBox').value = "1";
            $item('#text5').text = clickedItemData.quantityInStock + " units in stock"
            $item('#text5').expand();
            setTimeout(() => $item('#text5').collapse(), 5000);
        }
    } else {
        let variant = await getVariant(clickedItemData._id);
        let variantInStock = 0;
        for (let i = 0; i < variant.length; i++) {
            if (variant[i].sku == $item('#itemSku').text) {
                variantInStock = variant[i].stock.quantity
                break
            }
        }
        if (total > parseFloat(variantInStock)) {
            $item('#quantity').value = "" + variantInStock;
            $item('#totalUnits').text = "" + variantInStock;
            $item('#quantityBox').value = "1";
            $item('#text5').text = variantInStock + " units in stock"
            $item('#text5').expand();
            setTimeout(() => $item('#text5').collapse(), 5000);
        }
    }
}

function xero($item) {
    if (parseFloat($item("#quantity").value) < 0 || $item("#quantity").value == "") {
        $item('#quantity').value = "1";
    } else if (parseFloat($item("#quantityBox").value) < 0 || $item("#quantityBox").value == "") {
        $item('#quantityBox').value = "1";
    }
}

function quantity2(params, itemData) {
    let $item = $w.at(params.context);
    let quantity = $item('#input8').value;
    //console.log(quantity)
    //console.log(itemData)

    if (parseFloat(quantity) > parseFloat(itemData.Total)) {
        $item('#input8').value = itemData.Total;
    } else if (parseFloat(quantity) <= 0) {
        $item('#input8').value = "1";
    }

    for (let i = 0; i < arrayElements.length; i++) {
        if (arrayElements[i]._id == itemData._id) {
            arrayElements[i].Quantity = $item('#input8').value;
            break;
        }
    }
    subtotal(arrayElements);
    FormOrder(arrayElements);
}

async function getVariant(params) {
    let x
    await wixData.query("Stores/Variants")
        .eq("productId", params)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                x = results.items
            }
        })
        .catch((err) => {
            console.log(err);
        });
    return x
}

// ===================================================== ADD =====================================================
async function Add(event) {
    let $item = $w.at(event.context);
    let item = $item("#dataset1").getCurrentItem();
    let x = false;

    if (item.sku) x = true
    else {
        if ($item('#dropVariant').valid) {
            x = true;
            $item('#Add').label = "✓";
            setTimeout(() => $item('#Add').label = "Add cart", 2000);
        } else {
            $item('#text5').text = "Select Weight"
            $item('#text5').expand();
            //$item('#itemSku').expand()
            setTimeout(() => $item('#text5').collapse(), 2000);
            $item('#dropVariant').focus();
        }
    }

    if (x) {
        let Quantity = parseFloat($item('#totalUnits').text);

        let json = {
            "_id": item._id,
            "Title": item.name,
            "sku": $item('#itemSku').text,
            "Quantity": Quantity,
            "Price": parseFloat($item('#price').text),
            "weight": parseFloat($item('#vWeight').text),
            "mediaItem": {
                "altText": item.mediaItems[0].title,
                "src": item.mediaItems[0].src
            },
            "Total": item.quantityInStock
        };

        if (!(item.sku)) {
            let addVariant = await getVariant(item._id);
            console.log('Variant', addVariant)
            for (let i = 0; i < addVariant.length; i++) {
                console.log(addVariant[i].sku, $item('#dropVariant').value)
                if (addVariant[i].sku == $item('#dropVariant').value) {
                    console.log(i)
                    json.variantId = addVariant[i].variantId
                    json.options = [{
                        "option": "Weight",
                        "selection": addVariant[i].choices.Weight
                    }]
                    //json.weight = $item('#vWeight').text
                    break
                }
            }
        }
        console.log('JSON', json)
        if (arrayElements.length > 0) {
            let x = 0;
            for (let i = 0; i < arrayElements.length; i++) {
                //console.log(i)
                //console.log(arrayElements[i].id, json.id)

                if (arrayElements[i]._id == json._id) {
                    let sum = parseFloat(arrayElements[i].Quantity) + Quantity;
                    //console.log(i, arrayElements[i].Quantity, $item('#quantity').value, sum, item.quantityInStock);

                    if (sum > item.quantityInStock) {
                        arrayElements[i].Quantity = item.quantityInStock;
                        $item('#text5').text = item.quantityInStock + " units in stock";
                        $item('#text5').expand();
                        setTimeout(() => $item('#text5').collapse(), 5000);
                        $item('#quantity').value = item.quantityInStock;
                    } else {
                        arrayElements[i].Quantity = sum;
                    }
                    $item('#quantity').value = '1';
                    $item('#quantityBox').value = "0";
                    $item('#totalUnits').text = "1";
                    x = 1;
                    break;
                }
            }
            if (x == 0) {
                arrayElements.push(json)
                $item('#quantity').value = '1';
                $item('#quantityBox').value = "0";
                $item('#totalUnits').text = "1";
            }

        } else {
            arrayElements.push(json);
            $item('#quantity').value = '1';
            $item('#quantityBox').value = "0";
            $item('#totalUnits').text = "1";
        }
        //console.log(arrayElements);
        updateRepeater(arrayElements);
        subtotal(arrayElements);
        FormOrder(arrayElements);
    }
}

function updateRepeater(arrayElements) {
    $w("#RPay").data = arrayElements;
    $w("#RPay").forEachItem(($item, itemData, index) => {
        $item("#RPayProduct").text = itemData.Title;
        //$item("#RPayQuantity").text = "" + itemData.Quantity;
        $item("#input8").value = itemData.Quantity;
        $item("#RPayPrice").text = "" + itemData.Price;
        //$item("#RPayProduct").onClick(() => console.log(itemData));
        $item("#close").onClick(() => remove(itemData._id));
        $item("#input8").onInput((event) => {
            quantity2(event, itemData);
        })
    });
    $w("#RBPay").expand();
}

function remove(id) {
    for (let i = 0; i < arrayElements.length; i++) {
        if (arrayElements[i]._id == id) {
            arrayElements.splice(i, 1);
            updateRepeater(arrayElements);
            break;
        }
    }
    if (arrayElements.length == 0) {
        $w('#RBPay').collapse();

    }
    subtotal(arrayElements);
    FormOrder(arrayElements)

}

function subtotal(arrayElements) {
    subtotalText = 0;
    for (let i = 0; i < arrayElements.length; i++) {
        subtotalText += arrayElements[i].Quantity * arrayElements[i].Price;
        //console.log(i, arrayElements[i].Quantity, arrayElements[i].Price, subtotalText)
    }
    //console.log(subtotalText)

    $w('#subtotal').text = "Total: $" + subtotalText.toFixed(2);
    $w('#text144').text = "Total: $" + subtotalText.toFixed(2);
    $w('#input15').value = "" + subtotalText.toFixed(2);
}

function FormOrder(arrayElements) {
    let orderForm = "";
    for (let i = 0; i < arrayElements.length; i++) {
        orderForm += arrayElements[i].Title + " x " + arrayElements[i].Quantity + "\n"
    }
    $w('#FormOrder').value = orderForm;
}

// ===================================================== CREATE ORDER =====================================================
function zonas() {
    if ($w('#checkbox1').checked == true) {

        $w('#checkOutShippingAddress').collapse();
        $w('#addressInput1').expand();
        if ($w('#addressInput1').value == undefined || $w('#addressInput1').value.city == undefined && $w('#addressInput1').value.country == undefined && $w('#addressInput1').value.postalCode == undefined) {
            $w('#submit').disable();
            $w('#text142').text = "Please select your address in Delivery address"
            $w('#text142').show();
            //setTimeout(() => $w('#text142').hide(), 10000);
        } else {
            $w('#submit').enable();
            $w('#text142').hide();
            $w('#text142').text = "Thanks for submitting!";
        }
    } else {
        $w('#checkOutShippingAddress').expand();
        $w('#addressInput1').collapse();
        $w('#submit').enable();
        $w('#text142').hide();
        $w('#text142').text = "Thanks for submitting!";
    }
}

function createOrderLF() {
    $w('#submit').disable();

    let jsonItems = [];

    for (let i = 0; i < arrayElements.length; i++) {
        console.log(arrayElements[i])
        let json = {
            "productId": arrayElements[i]._id,
            "lineItemType": "PHYSICAL",
            "mediaItem": {
                "altText": arrayElements[i].mediaItem.altText,
                "src": arrayElements[i].mediaItem.src
            },
            "name": arrayElements[i].Title,
            "quantity": arrayElements[i].Quantity,
            "sku": arrayElements[i].sku,
            "weight": arrayElements[i].weight,
            "priceData": {
                "price": arrayElements[i].Price
            }
        }
        if (arrayElements[i].variantId) {
            json.variantId = arrayElements[i].variantId
            json.options = arrayElements[i].options
        }

        jsonItems.push(json)
    }
    console.log(jsonItems)

    let Info = {};
    let BillingInfo = {};

    if ($w('#checkbox1').checked == true) {

        Info = {
            "deliveryOption": "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",
            "shipmentDetails": {
                "address": {
                    "formatted": $w('#addressInput1').value.formatted,
                    "city": $w('#addressInput1').value.city,
                    "country": $w('#addressInput1').value.country,
                    "addressLine": $w('#addressInput1').value.streetAddress.number + " " + $w('#addressInput1').value.streetAddress.name,
                    "postalCode": $w('#addressInput1').value.postalCode,
                },
                "lastName": $w('#input12').value,
                "firstName": $w('#input11').value,
                "email": $w('#input9').value,
                "phone": $w('#input10').value,
                "company": $w('#input13').value,
            }
        }

        BillingInfo = {
            "address": {
                "formatted": $w('#addressInput1').value.formatted,
                "city": $w('#addressInput1').value.city,
                "country": $w('#addressInput1').value.country,
                "addressLine": $w('#addressInput1').value.streetAddress.number + " " + $w('#addressInput1').value.streetAddress.name,
                "postalCode": $w('#addressInput1').value.postalCode
            },
            "lastName": $w('#input12').value,
            "firstName": $w('#input11').value,
            "email": $w('#input9').value,
            "phone": $w('#input10').value,
            "company": $w('#input13').value,
        }

    } else {

        Info = {
            "deliveryOption": "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",
            "shipmentDetails": {
                "address": {
                    "formatted": $w('#checkOutComplete').text,
                    "city": $w('#checkoutCity').text,
                    "country": $w('#checkOutCountry').text,
                    "addressLine": $w('#checkOutAddress').text,
                    "postalCode": $w('#checkOutPostCode').text,
                },
                "lastName": $w('#input12').value,
                "firstName": $w('#input11').value,
                "email": $w('#input9').value,
                "phone": $w('#input10').value,
                "company": $w('#input13').value,
            }
        }

        BillingInfo = {
            "address": {
                "formatted": $w('#checkOutComplete').text,
                "city": $w('#checkoutCity').text,
                "country": $w('#checkOutCountry').text,
                "addressLine": $w('#checkOutAddress').text,
                "postalCode": $w('#checkOutPostCode').text,
            },
            "lastName": $w('#input12').value,
            "firstName": $w('#input11').value,
            "email": $w('#input9').value,
            "phone": $w('#input10').value,
            "company": $w('#input13').value,
        }

    }

    let minimumOrder = {
        "lineItems": jsonItems,
        "totals": {
            "subtotal": subtotalText,
            "total": subtotalText
        },
        "channelInfo": {
            "type": "WEB"
        },
        "paymentStatus": "NOT_PAID",
        "buyerNote": "\nWHOLESALE\nDelivery Intructions\n" + $w('#textBox2').value + "\n\nBusinnes Hours\n" + $w('#checkOutHours').value,
        "shippingInfo": Info,
        "billingInfo": BillingInfo
    }
    //console.log(minimumOrder)
    //console.log(subtotalText);

    createOrder(minimumOrder)
        .then((order) => {
            // Order created
            //const newOrderId = order._id;
            //const buyerEmail = order.buyerInfo.email;
            //console.log(order);
            setTimeout(() => {
                wixData.query("contact11")
                    .eq('email', order.billingInfo.email)
                    .descending('_createdDate')
                    .find()
                    .then((results) => {
                        if (results.items.length > 0) {
                            results.items[0].order = order.number
                            results.items[0].weight = order.totals.weight
                            wixData.update("contact11", results.items[0])
                                .then((results) => {
                                    //console.log(results)
                                    wixLocation.to('/thank-you-wholesales');
                                })
                                .catch((err) => {
                                    console.log(err)
                                });
                        } else {
                            // handle case where no matching items found
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    });
            }, 2000);

            //console.log(newOrderId, buyerEmail)
        })
        .catch((error) => {
            // Order not created
            let json = {
                "title": "Wholesales",
                "idk": $w('#input9').value,
                "error": error
            };

            wixData.insert("CatchErrorsLF", json)
                .then((results) => {
                    let item = results; //see item below
                })
                .catch((err) => {
                    console.log(err)
                });
            console.error(error);
        });

}

// ===================================================== REMOVE INVENTORY - DON'T USE IN THIS CASE =====================================================
async function removeInventory() {
    for (let i = 0; i < arrayElements.length; i++) {
        //console.log(arrayElements[i])     
        decrementHandler(arrayElements[i])
    }
    wixLocation.to('/thank-you');
}

export async function decrementHandler(decrementInfo) {
    //let number = parseFloat(decrementInfo.Total) - parseFloat(decrementInfo.Quantity);
    const productId = decrementInfo._id
    let variants = await getProductVariants(productId);
    //console.log(variants);

    decrementInventory(
            [{
                variantId: variants[0]._id,
                productId: productId,
                decrementBy: parseFloat(decrementInfo.Quantity)
            }])
        .then(() => {
            //console.log("Inventory decremented successfully")
        })
        .catch(error => {
            // Inventory decrement failed
            console.error(error);
        })
}