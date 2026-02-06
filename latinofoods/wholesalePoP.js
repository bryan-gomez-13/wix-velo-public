import { getMemberInfoFromCollection, multiOptionsColletions, getProductBySKU, getVariantsFromCollection, getVariantInfoBySku, checkStock, saveOrderBack } from 'backend/Wholesales/collections.web.js';
import { createOrderBack } from 'backend/Wholesales/inventory.jsw'

import { session } from 'wix-storage-frontend';
import { authentication, currentMember } from 'wix-members-frontend';
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';

var arrayElements = [];
var subtotalText = 0,
    memberInfo;

$w.onReady(function () {
    // $w('#shoppingCartIcon3').hide();
    initial();
    authentication.onLogin(async () => initial());
});

function initial() {
    console.log(session.getItem("Order"))
    if (session.getItem("Order")) sessionOrder();

    getRoleByWS();
    getUserInfo();
    filterProducts();
    init();
}

function init() {
    //MultiStateBox
    $w('#BOrder').onClick(() => Buttons(1));
    $w('#goToCheck').onClick(() => Buttons(1));
    $w('#BProducts').onClick(() => Buttons(2));
    $w('#continueShopping').onClick(() => Buttons(2));
    $w('#back').onClick(() => Buttons(2));
    $w('#cartPage').onClick(() => Buttons(3));

    // Filter
    $w('#search').onInput(() => filterLatino());
    $w('#filter').onChange(() => filterLatino());
    $w('#sort').onChange(() => sortAsDes());

    // Other
    $w('#changeChippingAddress').onChange(() => zonas());
    $w('#addressInput').onChange(() => zonas());

    $w('#submit').onClick(() => createOrderLF());

    $w('#thankYouButton').onClick(() => {
        $w('#headerMenu').expand();

        getUserInfo();
        updateRepeater();
        subtotal();
        FormOrder();
        Buttons(2);
    })

    //Checkout
    $w('#FormOrder').onInput(() => FormOrder())

    // Rep Products
    $w('#dataWholesales').onReady(() => {
        $w('#repProducts').onItemReady(async ($item, itemData, index) => {
            // in Stock refetence
            if (itemData.inStock == false) {
                $item('#Add').label = 'Out of stock'
                $item('#Add').disable();
            }

            $item('#wsRRP').text = "RRP: $" + itemData.price;

            // ============================== GET ITEM INFO
            if (itemData.sku) {
                $item('#dropVariant').collapse();
                let infoFromCollection = await getProductBySKU(itemData.sku);
                if (infoFromCollection !== false) {
                    $item('#wsErrMessage').collapse();
                    $item('#wsPrice').text = "Wholesale Price: $" + parseFloat(infoFromCollection.wholesalesPrice);

                    if (infoFromCollection.unitPerBox !== undefined && infoFromCollection.unitPerBox !== null && infoFromCollection.unitPerBox !== 0) $item('#wsUnits').text = "Units per case: " + infoFromCollection.unitPerBox;

                    if (infoFromCollection.name !== undefined && infoFromCollection.name !== null) $item('#productName').text = infoFromCollection.name;
                    else $item('#productName').text = itemData.name;

                    $item('#wsBestBefore').text = "Best before: " + infoFromCollection.expiryDate;

                    let weightFloat = "";
                    if (parseFloat(infoFromCollection.weight) < 1) weightFloat = infoFromCollection.weightKg * 1000 + '(g/ml)';
                    else weightFloat = infoFromCollection.weightKg + 'Kg/L';
                    $item('#wsWeight').text = "Weight: " + weightFloat;
                } else {
                    $item('#wsBestBefore').collapse();
                    $item('#wsWeight').collapse();
                    $item('#wsUnits').collapse();
                    $item('#wsErrMessage').expand();
                    $item('#Add').disable();
                }

            } else {
                $item('#Add').disable();

                let variants = await getVariantsFromCollection(itemData._id, itemData.productOptions);
                if (variants !== false) {
                    $item('#dropVariant').options = variants;
                    $item('#dropVariant').expand();
                    itemData.variants = variants;
                } else {
                    $item('#wsBestBefore').collapse();
                    $item('#wsWeight').collapse();
                    $item('#wsUnits').collapse();
                    $item('#wsErrMessage').expand();
                    $item('#Add').disable();
                }
            }

            // ============================== DROP VARIANT CHANGE
            $item('#dropVariant').onChange(async () => {
                let infoFromCollection = await getProductBySKU($item('#dropVariant').value);
                if (infoFromCollection !== false) {
                    $item('#wsErrMessage').collapse();
                    $item('#wsPrice').text = "Wholesale Price: $" + parseFloat(infoFromCollection.wholesalesPrice);

                    if (infoFromCollection.unitPerBox !== undefined && infoFromCollection.unitPerBox !== null && infoFromCollection.unitPerBox !== 0) $item('#wsUnits').text = infoFromCollection.unitPerBox;

                    if (infoFromCollection.name !== undefined && infoFromCollection.name !== null) $item('#productName').text = infoFromCollection.name;
                    else $item('#productName').text = itemData.name;

                    $item('#wsBestBefore').text = "Best before: " + infoFromCollection.expiryDate;

                    let weightFloat = "";
                    if (parseFloat(infoFromCollection.weight) < 1) weightFloat = infoFromCollection.weight * 1000 + '(g/ml)';
                    else weightFloat = infoFromCollection.weight + 'Kg/L';
                    $item('#wsWeight').text = "Weight: " + weightFloat;

                    $item('#quantity').enable();
                    $item('#Add').enable();
                } else {
                    $item('#quantity').disable();
                    $item('#Add').disable();

                    $item('#wsBestBefore').collapse();
                    $item('#wsWeight').collapse();
                    $item('#wsUnits').collapse();
                    $item('#wsErrMessage').expand();
                }

                let getQuantityByCollection = await getVariantInfoBySku($item('#dropVariant').value);
                if (getQuantityByCollection.stock.trackQuantity && parseFloat(quantityRep.value) > getQuantityByCollection.stock.quantity) {
                    quantityRep.value = getQuantityByCollection.stock.quantity;
                    $item('#wsMessage').text = getQuantityByCollection.stock.quantity + " units in stock";
                    $item('#wsMessage').expand();
                    setTimeout(() => $item('#wsMessage').collapse(), 5000);
                }
            });

            // ============================== QUANTITY
            let quantityRep = $item('#quantity')
            quantityRep.onInput(async () => {
                if (parseFloat(quantityRep.value) < 0 || quantityRep.value == "") quantityRep.value = "1";
                if (itemData.sku) {
                    if (itemData.trackInventory && parseFloat(quantityRep.value) > itemData.quantityInStock) {
                        quantityRep.value = itemData.quantityInStock;
                        $item('#wsMessage').text = itemData.quantityInStock + " units in stock";
                        $item('#wsMessage').expand();
                        setTimeout(() => $item('#wsMessage').collapse(), 5000);
                    }
                } else {
                    if ($item('#dropVariant').valid) {
                        let getQuantityByCollection = await getVariantInfoBySku($item('#dropVariant').value);
                        if (getQuantityByCollection.stock.trackQuantity && parseFloat(quantityRep.value) > getQuantityByCollection.stock.quantity) {
                            quantityRep.value = getQuantityByCollection.stock.quantity;
                            $item('#wsMessage').text = getQuantityByCollection.stock.quantity + " units in stock";
                            $item('#wsMessage').expand();
                            setTimeout(() => $item('#wsMessage').collapse(), 5000);
                        }
                    }
                }
            });

            // ============================== ADD
            $item('#Add').onClick(async () => {
                $item('#Add').label = "✓";
                $item('#boxAdd').show();
                setTimeout(() => { $item('#Add').label = "Add cart", $item('#boxAdd').hide(); }, 1000);

                // Get Wholesales info
                let sku = (itemData.sku) ? itemData.sku : $item('#dropVariant').value
                let itemWholesalesInfo = await getProductBySKU(sku);

                let json = {
                    "_id": itemData._id,
                    "productId": itemData._id,
                    "Title": itemData.name,
                    "sku": sku,
                    "Quantity": $item('#quantity').value,
                    "Price": parseFloat(itemWholesalesInfo.wholesalesPrice),
                    "weight": parseFloat(itemWholesalesInfo.weightKg),
                    "mediaItem": {
                        "altText": itemData.mediaItems[0].title,
                        "src": itemData.mediaItems[0].src
                    },
                    "Total": itemData.quantityInStock
                };

                if (!(itemData.sku)) {
                    let addVariant = await getVariantInfoBySku(sku);
                    json.variantId = addVariant.variantId;
                    json.stockVariant = addVariant.stock.quantity;
                    json.Title += " " + addVariant.fullVariantName;
                    let bgh = addVariant.fullVariantName.split(" ");
                    json._id += "-" + bgh[0];

                    let nameOption = "";
                    for (var key in itemData.productOptions) {
                        nameOption = key
                    }

                    let selection = itemData.variants.find(variant => variant.value == $item('#dropVariant').value)

                    json.options = [{
                        "option": nameOption,
                        "selection": selection.label
                    }]
                }

                if (arrayElements.length > 0) {
                    let x = 0;
                    for (let i = 0; i < arrayElements.length; i++) {
                        if (arrayElements[i].productId == json.productId && arrayElements[i].sku == json.sku) {
                            let sum = parseFloat(arrayElements[i].Quantity) + parseFloat(json.Quantity);

                            let maxProduct = 0;
                            if (json.stockVariant) maxProduct = json.stockVariant
                            else maxProduct = itemData.quantityInStock

                            if (sum > maxProduct) {
                                arrayElements[i].Quantity = maxProduct;
                                $item('#wsMessage').text = maxProduct + " units in stock";
                                $item('#wsMessage').expand();
                                setTimeout(() => $item('#wsMessage').collapse(), 5000);
                                $item('#quantity').value = '' + maxProduct;
                            } else arrayElements[i].Quantity = sum;

                            x = 1;
                            break;
                        }
                    }
                    if (x == 0) arrayElements.push(json)
                } else arrayElements.push(json);

                $item('#quantity').value = '1';

                separatorArrayToString();
                updateRepeater();

                subtotal();
                FormOrder();
            });
        })
    })

}

// ===================================================== GET USER INFO =====================================================
function getRoleByWS() {
    currentMember.getRoles().then((roles) => {
        console.log(roles)
        const checkWS = roles.find(item => item._id == "cd559c50-9463-40e3-80f0-c4190f05eab2")
        if (roles.length > 0 && checkWS) $w('#secWS').show();
        else wixLocationFrontend.to("/wholesales");
    }).catch((error) => { console.error(error); });
}

function getUserInfo() {
    currentMember.getMember({ fieldsets: ['FULL'] }).then(async (member) => {
        memberInfo = await getMemberInfoFromCollection(member.loginEmail)
        $w('#email').value = memberInfo.email;
        $w('#loginEmail').text = `You are logged in with ${memberInfo.email}`;
        $w('#phone').value = memberInfo.phone + "";
        $w('#firstName').value = memberInfo.firstName;
        $w('#lastName').value = memberInfo.lastName;

        $w('#address').html = '<p class="wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text">Shipping Address</span></p>'
        $w('#address').html += '<p class="wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text">Address:&nbsp;</span>' + memberInfo.addressLine + '</p>';
        $w('#address').html += '<p class="wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text">City:&nbsp;</span>' + memberInfo.city + '</p>';
        $w('#address').html += '<p class="wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text">Postal Code:&nbsp;</span>' + memberInfo.postalCode + '</p>';
        $w('#address').html += '<p class="wixui-rich-text__text"><span style="font-weight:bold;" class="wixui-rich-text__text">Country:</span>' + memberInfo.country + '</p>'

        $w('#company').value = memberInfo.companyName;
        $w('#businessHours').value = memberInfo.businessHoursToReceiveYourOrder;
    }).catch((error) => console.error(error));
}

// ===================================================== FILTER & SORT =====================================================
async function filterProducts() {
    let filter = await multiOptionsColletions();
    $w('#filter').options = filter;
}

async function filterLatino() {
    let filter = await wixData.filter();
    //Search filter
    if ($w('#search').value.length > 0) filter = filter.and(wixData.filter().contains('name', $w('#search').value).and(wixData.filter().eq("collections", ["4ede0187-741f-4bc9-bab5-cb631049c4e7"])));

    //Collection filter
    if ($w('#filter').value.length == 0) {
        filter = filter.and(wixData.filter().hasSome("collections", ["00000000-000000-000000-000000000001"]).and(wixData.filter().eq("collections", ["4ede0187-741f-4bc9-bab5-cb631049c4e7"])))
    } else {
        filter = filter.and(wixData.filter().hasSome("collections", $w('#filter').value).and(wixData.filter().eq("collections", ["4ede0187-741f-4bc9-bab5-cb631049c4e7"])))
    }

    $w("#dataWholesales").setFilter(filter);
    sortAsDes();
}

function sortAsDes() {
    switch ($w('#sort').value) {
    case 'A-Z':
        $w("#dataWholesales").setSort(wixData.sort().ascending("name"))
        break;

    case 'Z-A':
        $w("#dataWholesales").setSort(wixData.sort().descending("name"))
        break;

    case 'Low - High':
        $w("#dataWholesales").setSort(wixData.sort().ascending("price"))
        break;

    case 'High - Low':
        $w("#dataWholesales").setSort(wixData.sort().descending("price"))
        break;

    default:
        $w("#dataWholesales").setSort(wixData.sort())
        break;
    }
}

// ===================================================== BUTTONS =====================================================
function Buttons(key) {
    switch (key) {
    case 1:
        $w('#Box').changeState('Pay');
        $w('#back').expand();
        $w('#BOrder').disable();
        $w('#cartPage').enable();
        $w('#BProducts').enable();
        break;

    case 2:
        $w('#Box').changeState('Products');
        $w('#back').collapse();
        $w('#BProducts').disable();
        $w('#cartPage').enable();
        $w('#BOrder').enable();
        break;

    case 3:
        $w('#Box').changeState('CartPage');
        $w('#back').expand();
        $w('#cartPage').disable();
        $w('#BProducts').enable();
        $w('#BOrder').enable();
        break;
    }
}

// ===================================================== ZONAS =====================================================
function zonas() {
    if ($w('#changeChippingAddress').checked) {

        $w('#address').collapse();
        $w('#addressInput').expand();
        if ($w('#addressInput').value == undefined || $w('#addressInput').value.city == undefined && $w('#addressInput').value.country == undefined && $w('#addressInput').value.postalCode == undefined) {
            $w('#submit').disable();
            $w('#messageCheckout').text = "Please select your address in Delivery address"
            $w('#messageCheckout').show();
        } else {
            $w('#submit').enable();
            $w('#messageCheckout').hide();
            $w('#messageCheckout').text = "Thanks for submitting!";
        }
    } else {
        $w('#address').expand();
        $w('#addressInput').collapse();
        $w('#submit').enable();
        $w('#messageCheckout').hide();
        $w('#messageCheckout').text = "Thanks for submitting!";
    }
}

// ===================================================== SAVE ORDER IN STORAGE =====================================================
function separatorArrayToString() {
    let sessionOrder = "";
    console.log(arrayElements)
    arrayElements.sort((a, b) => a.Title.localeCompare(b.Title));

    for (let i = 0; i < arrayElements.length; i++) {
        if (i == (arrayElements.length - 1)) sessionOrder += JSON.stringify(arrayElements[i])
        else sessionOrder += JSON.stringify(arrayElements[i]) + "-Latino-"
    }

    session.setItem("Order", sessionOrder);
}

async function sessionOrder() {
    arrayElements = await JsonToArray(session.getItem("Order").split('-Latino-'))

    updateRepeater();
    subtotal();
    FormOrder();
}

async function JsonToArray(Order) {
    // Map all promises at once
    const promises = Order.map(async (orderItem) => {
        let json = JSON.parse(orderItem);
        let checkStockV = await checkStock(json);
        return checkStockV.status ? checkStockV.json : null;
    });

    // Resolve all in parallel
    const results = await Promise.all(promises);

    // Filter out null values (items with no stock)
    return results.filter(item => item !== null);
}

// ===================================================== UPDATE CHECKOUT =====================================================
function updateRepeater() {
    $w("#RPay").data = arrayElements;
    $w("#RPay").forEachItem(($item, itemData, index) => {
        $item('#imageCartPage').src = itemData.mediaItem.src
        $item('#imageCartPage').alt = itemData.mediaItem.title
        $item("#RPayProduct").text = itemData.Title;

        $item("#rPayQuantity").value = itemData.Quantity;
        $item("#RPayPrice").text = "Price: $" + itemData.Price;

        $item("#close").onClick(async () => {
            for (let i = 0; i < arrayElements.length; i++) {
                if (arrayElements[i]._id == itemData._id && arrayElements[i].sku == itemData.sku) {
                    arrayElements.splice(i, 1);
                    break;
                }
            }

            if (arrayElements.length == 0) $w('#RPay').collapse()

            separatorArrayToString();
            updateRepeater();
            subtotal();
            FormOrder();
        });

        $item("#rPayQuantity").onInput(() => {
            let maxProduct = 0;
            if (itemData.stockVariant) maxProduct = itemData.stockVariant
            else maxProduct = itemData.Total

            if (parseFloat($item("#rPayQuantity").value) > parseFloat(maxProduct)) $item('#rPayQuantity').value = '' + maxProduct;
            else if (parseFloat($item("#rPayQuantity").value) <= 0 || $item("#rPayQuantity").value == "") $item('#rPayQuantity').value = "1";

            for (let i = 0; i < arrayElements.length; i++) {
                if (arrayElements[i]._id == itemData._id) {
                    arrayElements[i].Quantity = $item('#rPayQuantity').value;
                    break;
                }
            }

            separatorArrayToString();
            subtotal();
            FormOrder();
        })
    });

    $w("#RPay").expand();
}

// ===================================================== SUBTOTAL =====================================================
function subtotal() {
    subtotalText = 0;
    for (let i = 0; i < arrayElements.length; i++) {
        if (arrayElements[i].Quantity == null || arrayElements[i].Quantity == undefined || arrayElements[i].Quantity == "NaN") {
            arrayElements[i].Quantity = 1
        }
        subtotalText += arrayElements[i].Quantity * arrayElements[i].Price;
    }

    $w('#subtotal').text = "Total: $" + subtotalText.toFixed(2);
    $w('#subtotalCartPage').text = "Total: $" + subtotalText.toFixed(2);
    return subtotalText.toFixed(2)
}

// ===================================================== CHECKOUT =====================================================
function FormOrder() {
    let orderForm = "";
    for (let i = 0; i < arrayElements.length; i++) {
        orderForm += arrayElements[i].Title + " x " + arrayElements[i].Quantity + "\n"
    }
    $w('#FormOrder').value = orderForm;
    return { ok: true }
}

// ===================================================== CREATE ORDER =====================================================
async function getAllResults(query) {
    let results = await query.limit(100).find({ "suppressAuth": true, "suppressHooks": true });
    let allItems = results.items;

    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }

    return allItems;
}

async function createOrderLF() {
    let minimumOrder;

    let Info = {};
    let BillingInfo = {};
    let buyerNote = '';
    let jsonItems = [];

    try {
        $w('#Box').changeState('createOrder');
        $w('#thankYouButton').hide();
        $w('#headerMenu').collapse();

        await sessionOrder();

        let jsonItems = [];
        let badProducts = [];
        let productsBadQuantity = "";
        let productsBadWeight = "";
        let QuantityV = false;
        let weightV = false;

        // -------------------------------------------
        // STEP 1: Collect SKUs and IDs for bulk queries
        // -------------------------------------------
        const skus = arrayElements.map(e => e.sku);
        const ids = arrayElements.map(e => e._id);

        // -------------------------------------------
        // STEP 2: Query entire collections with filters
        // Avoids 100s or 1000s of repeated queries
        // -------------------------------------------
        const wholesaleResults = await getAllResults(wixData.query("WholesalesProducts").hasSome("sku", skus));
        const storeResults = await getAllResults(wixData.query("Stores/Products").hasSome("_id", ids));

        // -------------------------------------------
        // STEP 3: Build fast lookup maps (O(1))
        // -------------------------------------------
        const wholesaleMap = {};
        wholesaleResults.forEach(item => {
            wholesaleMap[item.sku] = item;
        });

        const storeMap = {};
        storeResults.forEach(item => {
            storeMap[item._id] = item;
        });

        // -------------------------------------------
        // STEP 4: Process each product without querying
        // -------------------------------------------
        const promises = arrayElements.map(async element => {

            const wItem = wholesaleMap[element.sku];
            const sItem = storeMap[element._id];

            // ---------------------------
            // PRICE & WEIGHT VALIDATION
            // ---------------------------
            if (!element.Price || !element.weight) {

                if (wItem?.price && wItem?.weight) {
                    element.Price = parseFloat(wItem.price);
                    element.weight = parseFloat(wItem.weight);

                } else if (sItem?.price && sItem?.weight) {
                    element.Price = parseFloat(sItem.price);
                    element.weight = parseFloat(sItem.weight);
                    badProducts.push(element.Title);
                }
            }

            // ---------------------------
            // QUANTITY VALIDATION
            // ---------------------------
            if (!element.Quantity || element.Quantity === "NaN" || element.Quantity === "0") {
                if (!QuantityV) QuantityV = true;
                productsBadQuantity += `${element.Title} - `;
                element.Quantity = 1;
            }

            // ---------------------------
            // WEIGHT VALIDATION
            // ---------------------------
            if (!element.weight || element.weight === "NaN") {
                if (!weightV) weightV = true;
                productsBadWeight += `${element.Title} - `;
                element.weight = 1;
            }

            // ---------------------------
            // STOCK VALIDATION
            // ---------------------------
            const stockValidation = await checkStock(element);

            if (stockValidation.status) {
                let json = {
                    productId: element.productId,
                    lineItemType: "PHYSICAL",
                    mediaItem: {
                        altText: element.mediaItem.altText,
                        src: element.mediaItem.src
                    },
                    name: element.Title,
                    quantity: parseFloat(stockValidation.json.quantity),
                    sku: element.sku,
                    weight: parseFloat(element.weight),
                    priceData: {
                        price: parseFloat(element.Price)
                    }
                };

                if (element.variantId) {
                    json.variantId = element.variantId;
                    json.options = element.options;
                }

                jsonItems.push(json);
            }
        });

        // Wait for all async tasks
        await Promise.all(promises);

        await Promise.all(promises);
        await subtotal();

        //Message in the order 
        let message = "\n"
        for (let i = 0; i < badProducts.length; i++) {
            message += badProducts[i] + " to be verifed\n"
        }

        // Variable si la dirreccion esta mala
        let addressVariable = false;

        if ($w('#changeChippingAddress').checked) {

            const address = safeAddressInput();

            Info = {
                deliveryOption: "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",

                shipmentDetails: {
                    address: {
                        formatted: address.formatted,
                        city: address.city,
                        country: address.country,
                        addressLine: address.addressLine,
                        postalCode: address.postalCode
                    },

                    // Safe Wix inputs + safe fallback from memberInfo
                    lastName: safeField("#lastName", safe(memberInfo, "lastName")),
                    firstName: safeField("#firstName", safe(memberInfo, "firstName")),
                    email: safeField("#email", safe(memberInfo, "email")),
                    phone: safeField("#phone", safe(memberInfo, "phone")),
                    company: safeField("#company", safe(memberInfo, "companyName"))
                }
            };

            BillingInfo = {
                address: {
                    formatted: address.formatted,
                    city: address.city,
                    country: address.country,
                    addressLine: address.addressLine
                },

                lastName: safeField("#lastName", safe(memberInfo, "lastName")),
                firstName: safeField("#firstName", safe(memberInfo, "firstName")),
                email: safeField("#email", safe(memberInfo, "email")),
                phone: safeField("#phone", safe(memberInfo, "phone")),
                company: safeField("#company", safe(memberInfo, "companyName"))
            };

        } else {
            if (!(memberInfo.addressLine)) {
                addressVariable = true;
                Info = {
                    deliveryOption: "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",

                    shipmentDetails: {
                        address: {
                            formatted: "3 Porters Avenue, Eden Terrace, Auckland, New Zealand",
                            city: "Auckland",
                            country: "NZ",
                            addressLine: "3 Porters Avenue",
                            postalCode: "1024"
                        },

                        // Safe Wix values or safe memberInfo fallback
                        lastName: safeField("#lastName", safe(memberInfo, "lastName")),
                        firstName: safeField("#firstName", safe(memberInfo, "firstName")),
                        email: safeField("#email", safe(memberInfo, "email")),
                        phone: safeField("#phone", safe(memberInfo, "phone")),
                        company: safeField("#company", safe(memberInfo, "companyName"))
                    }
                };

                BillingInfo = {
                    address: {
                        formatted: "3 Porters Avenue, Eden Terrace, Auckland, New Zealand",
                        city: "Auckland",
                        country: "NZ",
                        addressLine: "3 Porters Avenue",
                        postalCode: "1024"
                    },

                    lastName: safeField("#lastName", safe(memberInfo, "lastName")),
                    firstName: safeField("#firstName", safe(memberInfo, "firstName")),
                    email: safeField("#emailEl codgiasd", safe(memberInfo, "email")),
                    phone: safeField("#phone", safe(memberInfo, "phone")),
                    company: safeField("#company", safe(memberInfo, "companyName"))
                };
            } else {
                Info = {
                    deliveryOption: "SHIPPING TO YOUR STORE - TO BE CONFIRMED\nFee calculated after you place the order",

                    shipmentDetails: {
                        address: {
                            // Safe access to memberInfo fields
                            formatted: safe(memberInfo, "deliveryAddress"),
                            city: safe(memberInfo, "city"),
                            country: safe(memberInfo, "country"),
                            addressLine: safe(memberInfo, "addressLine"),
                            postalCode: safe(memberInfo, "postalCode", "") + "" // Always string
                        },

                        // Safe values: Wix input if valid, otherwise memberInfo value
                        lastName: safeField("#lastName", safe(memberInfo, "lastName")),
                        firstName: safeField("#firstName", safe(memberInfo, "firstName")),
                        email: safeField("#email", safe(memberInfo, "email")),
                        phone: safeField("#phone", safe(memberInfo, "phone")),
                        company: safeField("#company", safe(memberInfo, "companyName"))
                    }
                };

                BillingInfo = {
                    address: {
                        formatted: safe(memberInfo, "deliveryAddress"),
                        city: safe(memberInfo, "city"),
                        country: safe(memberInfo, "country"),
                        addressLine: safe(memberInfo, "addressLine"),
                        postalCode: safe(memberInfo, "postalCode", "") + ""
                    },

                    lastName: safeField("#lastName", safe(memberInfo, "lastName")),
                    firstName: safeField("#firstName", safe(memberInfo, "firstName")),
                    email: safeField("#email", safe(memberInfo, "email")),
                    phone: safeField("#phone", safe(memberInfo, "phone")),
                    company: safeField("#company", safe(memberInfo, "companyName"))
                };
            }

        }

        let buyerNote = "\nWHOLESALE\nDelivery Intructions\n" + $w('#deliveryInstructions').value + "\n\nBusinnes Hours\n" + $w('#businessHours').value + message;
        if (addressVariable) buyerNote += "\n\n Problem with the address, confirm address in collection"

        if (weightV) buyerNote += "\n" + productsBadWeight;
        if (QuantityV) buyerNote += "\n" + productsBadQuantity;

        jsonItems.sort((a, b) => a.name.localeCompare(b.name));

        minimumOrder = {
            "lineItems": jsonItems,
            "totals": {
                "subtotal": subtotalText,
                "total": subtotalText
            },
            "channelInfo": {
                "type": "WEB"
            },
            "paymentStatus": "NOT_PAID",
            "buyerNote": buyerNote,
            "shippingInfo": Info,
            "billingInfo": BillingInfo
        }
        console.log("Order", minimumOrder)

        await FormOrder();
        let jsonOrder = await saveOrderBack(minimumOrder, $w('#FormOrder').value);
        console.log(jsonOrder)

        createOrderBack(minimumOrder, jsonOrder).then((order) => {
            console.log(order)
            setTimeout(async () => {
                session.removeItem("Order");
                arrayElements = [];

                if (order.status) {
                    $w('#thankYouMessage').text = "Order created successfully\nOrder:" + order.number;
                    $w('#thankYouButton').show();
                    $w('#Box').changeState("ThankYou");
                    $w('#Box').scrollTo();
                } else {
                    $w('#thankYouMessage').text = "Something went wrong, reload the page and send the error again, if the problem persists contact the administrator\nIssue:" + order.error;
                    $w('#thankYouButton').show();
                    $w('#Box').changeState("ThankYou");
                    $w('#Box').scrollTo();
                }

            }, 2000);
        }).catch((err) => {
            $w('#thankYouMessage').text = "Something went wrong, reload the page and send the error again, if the problem persists contact the administrator\nIssue:" + err, $w('#Box').changeState("ThankYou"), $w('#Box').scrollTo();
        })
    } catch (error) {

        let json = {
            "title": "Wholesales",
            "order": {
                "lineItems": jsonItems,
                "totals": {
                    "subtotal": subtotalText,
                    "total": subtotalText
                },
                "channelInfo": {
                    "type": "WEB"
                },
                "paymentStatus": "NOT_PAID",
                "buyerNote": buyerNote,
                "shippingInfo": Info,
                "billingInfo": BillingInfo
            },
            "error": error
        };

        var wixDataOptions = { "suppressAuth": true, "suppressHooks": true };
        await wixData.insert("CatchErrorsLF", json, wixDataOptions).catch((err) => { console.log(err) });
    }

}

// Helper to safely read memberInfo fields
function safe(obj, key, fallback = "") {
    return (obj && obj[key] !== undefined && obj[key] !== null) ? obj[key] : fallback;
}

// Helper to safely read a Wix input field
function safeField(fieldId, fallback = "") {
    const field = $w(fieldId);

    // Check if field exists and is valid
    if (field && typeof field.valid !== "undefined" && field.valid) {
        return field.value || fallback;
    }

    return fallback;
}

function safeAddressInput() {
    const addr = $w('#addressInput').value || {};

    return {
        formatted: safe(addr, "formatted", ""),
        city: safe(addr, "city", ""),
        country: safe(addr, "country", ""),

        addressLine: safe(addr.streetAddress, "number", "") +
            " " +
            safe(addr.streetAddress, "name", ""),

        postalCode: safe(addr, "postalCode", "") + ""
    };
}