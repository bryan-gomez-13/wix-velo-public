import { createOrder } from 'backend/inventory';
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
    $w('#searchProduct').onClick(() => searchProduct());
    $w('#submit').onClick(() => createOrderLF());
    $w('#submit').onMouseIn(() => zonas());
    $w('#filter').onChange(() => filterChange());

    $w("#repeater1").onItemReady(($item, itemData, index) => {
        //console.log(itemData)
        if (itemData.inStock == false) {
            $item('#Add').label = 'Out of stock'
            $item('#Add').disable();
        }

        wixData.query("Products")
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
        $item('#Add').onClick((event) => {
            let $item = $w.at(event.context);
            $item('#Add').label = "✓";
            setTimeout(() => $item('#Add').label = "Add cart", 2000);
        })

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
                        $w('#formAddress').value = firstItem.shortAnswerField3;
                        $w('#formCity').value = firstItem.shortAnswerField4;
                        $w('#formPostCode').value = firstItem.shortAnswerField5;
                        $w('#formCountry').value = firstItem.shortAnswerField6;
                        //$w('#addressInput1').value = firstItem.autocompleteAddress;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });
}

// ===================================================== FILTER =====================================================
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

function filterChange() {
    //console.log($w('#filter').value)
    let filter;

    if ($w('#filter').value.length == 0) {
        filter = wixData.filter().hasSome("collections", ["00000000-000000-000000-000000000001"]).and(wixData.filter().eq("collections", ["11eeee50-2bcd-974b-4a09-ffebe0c49622"]))
    } else {
        filter = wixData.filter().hasSome("collections", $w('#filter').value).and(wixData.filter().eq("collections", ["11eeee50-2bcd-974b-4a09-ffebe0c49622"]))
    }
    $w("#dataset1").setFilter(filter);
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
    //console.log(total)
    //console.log(clickedItemData.sku);
    if (total > parseFloat(clickedItemData.quantityInStock)) {
        $item('#quantity').value = clickedItemData.quantityInStock;
        $item('#totalUnits').text = "" + clickedItemData.quantityInStock;
        $item('#quantityBox').value = "0";
        $item('#text5').text = clickedItemData.quantityInStock + " units in stock"
        $item('#boxMessage').expand();
        setTimeout(() => $item('#boxMessage').collapse(), 5000);
    }
}

async function quantityBox(params) {
    let $item = $w.at(params.context);
    let clickedItemData = $item("#dataset1").getCurrentItem();
    //console.log(clickedItemData.sku);
    await xero($item);
    let total = (parseFloat($item('#Units').text) * parseFloat($item('#quantityBox').value)) + parseFloat($item("#quantity").value);
    $item('#totalUnits').text = "" + total;
    //console.log(total)
    if (total > parseFloat(clickedItemData.quantityInStock)) {
        $item('#quantity').value = clickedItemData.quantityInStock;
        $item('#totalUnits').text = "" + clickedItemData.quantityInStock;
        $item('#quantityBox').value = "0";
        $item('#text5').text = clickedItemData.quantityInStock + " units in stock"
        $item('#boxMessage').expand();
        setTimeout(() => $item('#boxMessage').collapse(), 5000);
    }
}

function xero($item) {
    if (parseFloat($item("#quantity").value) < 0 || $item("#quantity").value == "") {
        $item('#quantity').value = "0";
    } else if (parseFloat($item("#quantityBox").value) < 0 || $item("#quantityBox").value == "") {
        $item('#quantityBox').value = "0";
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

function searchProduct() {
    let filter = wixData.filter().contains('name', $w('#search').value).and(wixData.filter().eq("collections", ["11eeee50-2bcd-974b-4a09-ffebe0c49622"]));
    $w("#dataset1").setFilter(filter);
}

// ===================================================== ADD =====================================================
function Add(event) {
    let $item = $w.at(event.context);
    let item = $item("#dataset1").getCurrentItem();
    //console.log(item)
    let Quantity = 0;
    if (parseFloat($item('#totalUnits').text) == 0) {
        Quantity = 1;
    } else {
        Quantity = parseFloat($item('#totalUnits').text);
    }
    let json = {
        "_id": item._id,
        "Title": item.name,
        "sku": item.sku,
        "Quantity": Quantity,
        "Price": parseFloat($item('#price').text),
        "weight": item.weight,
        "mediaItem": {
            "altText": item.mediaItems[0].title,
            "src": item.mediaItems[0].src
        },
        "Total": item.quantityInStock
    };
    //console.log(json)
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
                    $item('#boxMessage').expand();
                    setTimeout(() => $item('#boxMessage').collapse(), 5000);
                    $item('#quantity').value = item.quantityInStock;
                } else {
                    arrayElements[i].Quantity = sum;
                }
                $item('#quantity').value = '0';
                $item('#quantityBox').value = "0";
                $item('#totalUnits').text = "0";
                x = 1;
                break;
            }
        }
        if (x == 0) {
            arrayElements.push(json)
            $item('#quantity').value = '0';
            $item('#quantityBox').value = "0";
            $item('#totalUnits').text = "0";
        }

    } else {
        arrayElements.push(json);
        $item('#quantity').value = '0';
        $item('#quantityBox').value = "0";
        $item('#totalUnits').text = "0";
    }
    //console.log(arrayElements);
    updateRepeater(arrayElements);
    subtotal(arrayElements);
    FormOrder(arrayElements);
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
    $w('#Total').value = "" + subtotalText.toFixed(2);
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
    try {
        checkValidation();
        $w('#addressInput1').value = $w('#formAddress').value + ', ' + $w('#formCity').value + ', ' + $w('#formPostCode').value + ', ' + $w('#formCountry').value
        $w('#submit').enable();
        $w('#text142').hide();
        $w('#text142').text = "Thanks for submitting!";
    } catch (error) {
        $w('#submit').disable();
        $w('#text142').text = error.message
        $w('#text142').show();
    }
}

function checkValidation() {
    if (!$w('#input9').valid) throw new Error('Missing Email');
    if (!$w('#input10').valid) throw new Error('Missing Phone');
    if (!$w('#input11').valid) throw new Error('Missing First Name');
    if (!$w('#input12').valid) throw new Error('Missing Last Name');

    if (!$w('#formAddress').valid) throw new Error('Missing Address');
    if (!$w('#formCity').valid) throw new Error('Missing City');
    if (!$w('#formPostCode').valid) throw new Error('Missing ¨Postal Code');
    if (!$w('#formCountry').valid) throw new Error('Missing Country');
    if (!$w('#checkAge').valid) throw new Error('Missing Check Validation');
}

function createOrderLF() {
    $w('#submit').disable();
    let jsonItems = [];

    for (let i = 0; i < arrayElements.length; i++) {
        jsonItems.push({
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
        })
    }

    let Info = {};
    let BillingInfo = {};

    Info = {
        "deliveryOption": "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",
        "shipmentDetails": {
            "address": {
                "formatted": $w('#formAddress').value + ', ' + $w('#formCity').value + ', ' + $w('#formPostCode').value + ', ' + $w('#formCountry').value,
                "city": $w('#formCity').value,
                "country": $w('#formCountry').value,
                "addressLine": $w('#formAddress').value,
                "postalCode": $w('#formPostCode').value,
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
            "formatted": $w('#formAddress').value + ', ' + $w('#formCity').value + ', ' + $w('#formPostCode').value + ', ' + $w('#formCountry').value,
            "city": $w('#formCity').value,
            "country": $w('#formCountry').value,
            "addressLine": $w('#formAddress').value,
            "postalCode": $w('#formPostCode').value
        },
        "lastName": $w('#input12').value,
        "firstName": $w('#input11').value,
        "email": $w('#input9').value,
        "phone": $w('#input10').value,
        "company": $w('#input13').value,
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
                wixData.query("responsiveGridSales022")
                    .eq('email', order.billingInfo.email)
                    .descending('_createdDate')
                    .find()
                    .then((results) => {
                        if (results.items.length > 0) {
                            results.items[0].order = order.number
                            results.items[0].weight = order.totals.weight
                            wixData.update("responsiveGridSales022", results.items[0])
                                .then((results) => {
                                    //console.log(results)
                                    console.log('GOOD')
                                    //wixLocation.to('/thank-you-wholesales');
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