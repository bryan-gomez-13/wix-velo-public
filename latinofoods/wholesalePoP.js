import { decrementInventory, getProductVariants } from 'backend/inventory';
import wixLocation from 'wix-location';
import wixUsers from 'wix-users';
import wixData from 'wix-data';

var arrayElements = [];
let subtotalText = 0;

$w.onReady(function () {
    $w('#shoppingCartIcon1').collapse();
    init();
    user();
});

function init() {
    $w('#Buy').onClick(() => Buttons(1));
    $w('#Back').onClick(() => Buttons(2));
    $w('#cart').onClick(() => Buttons(3));
    $w('#Add').onClick((event) => Add(event));
    $w('#quantity').onInput((Event) => quantity(Event))
    $w('#submit').onMouseIn(() => address());
    $w('#submit').onClick(() => removeInventory())

    $w("#repeater1").onItemReady(($item, itemData, index) => {
        console.log(itemData)
        if (itemData.inStock == false) {
            $item('#Add').label = 'Out of stock'
            $item('#Add').disable();
        }

        wixData.query("WholesalesProducts")
            .eq('sku', itemData.sku)
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    $item('#price').text = "" + results.items[0].price
                } else {
                    $item('#price').text = ""+itemData.price
                }
            })
            .catch((err) => {
                console.log('x',err);
            });
    });
}
// ===================================================== INFO USERS =====================================================
function user() {
    let user = wixUsers.currentUser;
    user.getEmail()
        .then((email) => {
            let userEmail = email; // "user@something.com"
            //console.log(userEmail)
            wixData.query("customSignup")
                .eq('email', userEmail)
                .find()
                .then((results) => {
                    if (results.items.length > 0) {
                        let firstItem = results.items[0]; //see item below
                        $w('#input1').value = firstItem.email;
                        $w('#input2').value = firstItem.phone;
                        $w('#input3').value = firstItem.firstName;
                        $w('#input4').value = firstItem.lastName;
                        $w('#input5').value = firstItem.companyName;
                        //$w('#addressInput1').value = firstItem.deliveryAddress;
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });
}

// ===================================================== BUTTONS =====================================================
/*
function addCart(event) {
    let $item = $w.at(event.context);
    let clickedItemData = $item("#dataset1").getCurrentItem();
    //console.log(clickedItemData);

    const products = [{
        "productId": clickedItemData._id,
        "quantity": parseInt($item('#quantity').value)
    }]

    cart.addProducts(products)
        .then((updatedCart) => {
            // Products added to cart
            const cartId = updatedCart._id;
            const cartLineItems = updatedCart.lineItems;
            //console.log(cartId);
            //console.log(cartLineItems);
        })
        .catch((error) => {
            // Products not added to cart
            console.error(error);
        });

    cart.showMiniCart();
    setTimeout(() => cart.hideMiniCart(), 3000);
}
*/
function Buttons(key) {
    switch (key) {
    case 1:
        $w('#Box').changeState('Pay');
        //$w('#Buy').collapse();
        //$w('#Back').expand();
        $w('#Buy').disable();
        $w('#cart').enable();
        $w('#Back').enable();
        break;

    case 2:
        $w('#Box').changeState('Products');
        //$w('#Back').collapse();
        //$w('#Buy').expand();
        $w('#Back').disable();
        $w('#cart').enable();
        $w('#Buy').enable();
        break;

    case 3:
        $w('#Box').changeState('CartPage');
        //$w('#Back').collapse();
        //$w('#Buy').expand();
        $w('#cart').disable();
        $w('#Back').enable();
        $w('#Buy').enable();
        break;
    }
}

// ===================================================== QUANTITY =====================================================
function quantity(params) {
    let $item = $w.at(params.context);
    let clickedItemData = $item("#dataset1").getCurrentItem();
    //console.log(clickedItemData);
    if (parseInt($item("#quantity").value) > parseInt(clickedItemData.quantityInStock)) {
        $item('#quantity').value = clickedItemData.quantityInStock;
        $item('#text5').text = "There are " + clickedItemData.quantityInStock + " Products"
        $item('#text5').expand();
        setTimeout(() => $item('#text5').collapse(), 3000);
    } else if (parseInt($item("#quantity").value) <= 0) {
        $item('#quantity').value = "1";
    }
}

function quantity2(params, itemData) {
    let $item = $w.at(params.context);
    let quantity = $item('#input8').value;
    //console.log(quantity)
    //console.log(itemData)

    if (parseInt(quantity) > parseInt(itemData.Total)) {
        $item('#input8').value = itemData.Total;
    } else if (parseInt(quantity) <= 0) {
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

// ===================================================== ADD =====================================================
function Add(event) {
    let $item = $w.at(event.context);
    let item = $item("#dataset1").getCurrentItem();
    let json = {
        "_id": item._id,
        "Title": item.name,
        "Quantity": parseInt($item('#quantity').value),
        "Price": parseInt($item('#price').text),
        "Total": item.quantityInStock
    };

    if (arrayElements.length > 0) {
        let x = 0;
        for (let i = 0; i < arrayElements.length; i++) {
            //console.log(i)
            //console.log(arrayElements[i].id, json.id)

            if (arrayElements[i]._id == json._id) {
                let sum = parseInt(arrayElements[i].Quantity) + parseInt($item('#quantity').value);
                //console.log(i, arrayElements[i].Quantity, $item('#quantity').value, sum, item.quantityInStock);

                if (sum > item.quantityInStock) {
                    arrayElements[i].Quantity = item.quantityInStock;
                    $item('#text5').text = "There are " + item.quantityInStock + " Products";
                    $item('#text5').expand();
                    setTimeout(() => $item('#text5').collapse(), 3000);
                    $item('#quantity').value = item.quantityInStock;
                } else {
                    arrayElements[i].Quantity = sum;
                }
                $item('#quantity').value = '1';
                x = 1;
                break;
            }
        }
        if (x == 0) {
            arrayElements.push(json)
            $item('#quantity').value = '1';
        }

    } else {
        arrayElements.push(json);
        $item('#quantity').value = '1';
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

    } else {
        subtotal(arrayElements);
        FormOrder(arrayElements)
    }
}

function subtotal(arrayElements) {
    subtotalText = 0;
    for (let i = 0; i < arrayElements.length; i++) {
        subtotalText += arrayElements[i].Quantity * arrayElements[i].Price;
        //console.log(i, arrayElements[i].Quantity, arrayElements[i].Price, subtotalText)
    }
    $w('#subtotal').text = "Total: $" + subtotalText;
}

function FormOrder(arrayElements) {
    let orderForm = "";
    for (let i = 0; i < arrayElements.length; i++) {
        orderForm += arrayElements[i].Title + " x " + arrayElements[i].Quantity + "\n"
    }
    $w('#FormOrder').value = orderForm;
}

function address() {
    $w('#input6').value = $w('#addressInput1').value.formatted;
    $w('#input7').value = "" + subtotalText;
    //console.log($w('#addressInput1').value.formatted)
}

// ===================================================== REMOVE INVENTORY =====================================================
export function removeInventory() {
    for (let i = 0; i < arrayElements.length; i++) {
        //console.log(arrayElements[i])     
        decrementHandler(arrayElements[i])
    }
    wixLocation.to('/thank-you')
}

export async function decrementHandler(decrementInfo) {
    //let number = parseInt(decrementInfo.Total) - parseInt(decrementInfo.Quantity);
    const productId = decrementInfo._id
    let variants = await getProductVariants(productId);
    console.log(variants);

    decrementInventory(
            [{
                variantId: variants[0]._id,
                productId: productId,
                decrementBy: parseInt(decrementInfo.Quantity)
            }])
        .then(() => {
            //console.log("Inventory decremented successfully")
        })
        .catch(error => {
            // Inventory decrement failed
            console.error(error);
        })
}