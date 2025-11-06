import { generalQuery } from 'backend/collections.web.js';
import { local } from 'wix-storage';
import { myAddToCurrentCartFunction } from 'backend/functions.web.js';
import { getVariantFromOptions } from "backend/collections.web.js";
import wixEcomFrontend from "wix-ecom-frontend";

var resultArray, product, variantInfo;
var checkOut = []

$w.onReady(async function () {
    init();
    getProductInfo();
    checkOut = local.getItem('checkOut') ? JSON.parse(local.getItem('checkOut')) : [];
});

function init() {
    $w('#addToCart').onClick(async () => {
        let allSelected = true;

        $w("#repOptions").forEachItem(($item, itemData, index) => {
            const value = $item("#dropOptions").value;

            if (!value) {
                allSelected = false;

                $item("#dropOptions").updateValidityIndication();
            }
        });

        if (allSelected) {
            let data = {
                lineItems: [{
                    catalogReference: {
                        appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
                        catalogItemId: product._id
                    },
                    // Get current selected quantity
                    quantity: $w('#quantity').value
                }, ],
            };

            if ($w('#repOptions').data.length > 0 && variantInfo.variantId !== undefined) {
                data.lineItems[0].catalogReference.options = {
                    "variantId": variantInfo.variantId
                };
            }

            myAddToCurrentCartFunction(data).then((updatedCurrentCart) => {
                wixEcomFrontend.refreshCart();
                wixEcomFrontend.openSideCart();
            }).catch((error) => console.error(error));
        }
    })

    $w('#addToQuote').onClick(async () => {
        $w('#addToQuote').disable();
        $w('#addToQuote').icon = '';
        $w('#addToQuote').label = '✓';

        const item = await getVariantInfo(true);
        let media = product.mainMedia;
        if (item.variantInfo !== undefined) media = item.variantInfo.media;

        let json = {
            name: product.name,
            quantity: Number($w('#quantity').value),
            image: media,
            price: $w('#price').text
        };

        if (product.productOptions) {
            const variantString = Object.entries(item.matchedVariant.choices)
                .flatMap(([key, value]) => [key, value])
                .map(item => item.replace(/\s+/g, '-'))
                .join('-');

            const formattedString = Object.entries(item.matchedVariant.choices)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');

            json._id = `${product._id}-${variantString}`;
            json.options = formattedString;
        } else {
            json._id = `${product._id}`;
        }

        const existingIndex = checkOut.findIndex(p => p._id === json._id);

        if (existingIndex !== -1) {
            checkOut[existingIndex].quantity += json.quantity;
        } else {
            checkOut.push(json);
        }

        // ✅ Save on local storage
        local.setItem('checkOut', JSON.stringify(checkOut));
        const totalQuantity = checkOut.reduce((sum, item) => {
            return sum + (item.quantity || 0);
        }, 0);

        $w('#quantityQuote').text = `${totalQuantity}`;
        // console.log(checkOut);
        setTimeout(() => {
            $w('#addToQuote').enable();
            $w('#addToQuote').icon = 'wix:vector://v1/11062b_93036baf8a5b4fa1a3e014e93d23350d.svg/';
            $w('#addToQuote').label = 'Add to Quote';
        }, 1000);
    })
}

async function getProductInfo() {
    product = await $w('#productPage1').getProduct();
    console.log(product)

    const itemOnCollections = await generalQuery('ProductsForAddToQuote', 'productId', product._id);

    $w('#name').text = product.name;
    if (product.sku == undefined) {
        $w('#sku').collapse();
    } else {
        $w('#sku').text = `SKU: ${product.sku}`;
        $w('#sku').expand();
    }

    $w('#price').text = product.formattedPrice;
    $w('#productDescription').html = product.description;

    // Transform the JSON into the desired array format
    if (product.productOptions) {
        resultArray = Object.entries(product.productOptions).map(([key, data]) => {
            const _id = key.toLowerCase().replace(/\s+/g, '-'); // slug format
            const values = data.choices
                .map(choice => ({
                    label: choice.value,
                    value: choice.value
                }))
                .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically

            return {
                name: data.name,
                _id: _id,
                values: values
            };
        });

        $w('#repOptions').data = resultArray;
        $w('#repOptions').onItemReady(($item, itemData) => {
            $item('#dropOptions').label = itemData.name;
            $item('#dropOptions').options = itemData.values;
            $item('#dropOptions').onChange(() => {
                // Set value
                itemData.value = $item('#dropOptions').value;
                getVariantInfo();
            })
        })
        $w('#repOptions').expand();
    } else {
        $w('#repOptions').collapse();
    }

    //  QUANTITY
    if (product.inStock) {
        $w('#gQuantitty').expand();
        // Ensure stock is always a number
        const stock = product.quantityInStock === undefined ? Infinity : Number(product.quantityInStock);

        // Plus
        $w('#plus').onClick(() => {
            let value = parseInt($w('#quantity').value) || 1;

            if (value < stock) {
                value++;
                $w('#quantity').value = value.toString();

                $w('#less').enable();
                if (value === stock) {
                    $w('#plus').disable();
                }
            }
        });

        // Less
        $w('#less').onClick(() => {
            let value = parseInt($w('#quantity').value) || 1;

            if (value > 1) {
                value--;
                $w('#quantity').value = value.toString();

                $w('#plus').enable();
                if (value === 1) {
                    $w('#less').disable();
                }
            }
        });

    } else {
        $w('#gQuantitty').collapse();
        // $w('#btAddToCart').disable();
    }

    // Add _id field as string, starting from "1"
    if (product.additionalInfoSections.length > 0) {
        const result = product.additionalInfoSections.map((item, index) => ({
            ...item,
            _id: String(index + 1)
        }));

        $w('#repAI').data = result;
        $w('#repAI').onItemReady(($item, itemData) => {
            $item('#aiTitle').text = itemData.title;
            $item('#aiDescription').html = itemData.description;

            $item('#aiPlus').onClick(() => {
                $item('#aiPlus').collapse();
                $item('#aiMinus').expand();
                $item('#aiDescription').expand();
            })

            $item('#aiMinus').onClick(() => {
                $item('#aiMinus').collapse();
                $item('#aiPlus').expand();
                $item('#aiDescription').collapse();
            })
        })

        $w('#repAI').expand();
    }

    let media = product.mediaItems.map(item => ({ type: item.type, src: item.src }))

    // Gallery
    $w('#gallery').items = media;

    if (itemOnCollections[0].addToQuote) $w('#addToQuote').expand();

    $w('#secLoading').collapse();
    $w('#secProduct').expand();
}

function getMatchingVariant(product, selectedChoices) {
    return product.variants.find(variant => {
        return Object.entries(selectedChoices).every(([key, value]) => {
            return variant.choices[key] === value;
        });
    });
}

async function getVariantInfo(returnItem) {
    const selectedChoices = {};

    // Collects the values selected from the drop-down menus.
    $w('#repOptions').forEachItem(($item, itemData, index) => {
        const value = $item('#dropOptions').value;
        if (value) {
            selectedChoices[itemData.name] = value;
        }
    });

    variantInfo = await getVariantFromOptions(product._id, selectedChoices);
    // console.log(variantInfo)
    
    if (variantInfo !== undefined) {
        let media = product.mediaItems.map(item => ({ type: item.type, src: item.src }))
        const jsonMedia = { src: variantInfo.media }
        media.unshift(jsonMedia)
        // Gallery
        $w('#gallery').items = media;

        $w('#gallery').collapse();
        $w('#image').src = variantInfo.media;
        $w('#image').alt = variantInfo.productName;
        $w('#image').tooltip = variantInfo.productName;
        $w('#image').expand();
    } else {
        $w('#image').collapse();
        $w('#gallery').expand();
    }

    // Find the matching variant
    const matchedVariant = getMatchingVariant(product, selectedChoices);
    // console.log(matchedVariant)

    if (matchedVariant) {
        $w('#price').text = matchedVariant.variant.formattedPrice;

        // Enable Add to cart and Add to Quote
        $w('#addToQuote').enable();
    } else {
        // $w('#price').text = "Not available";
    }

    if (returnItem) return { selectedChoices, matchedVariant, variantInfo }
}