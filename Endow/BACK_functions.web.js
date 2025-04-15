import { Permissions, webMethod } from "wix-web-module";
import wixStoresBackend from "wix-stores-backend";
import { checkout } from "wix-ecom-backend";
import { files } from "wix-media.v2";
import { elevate } from "wix-auth";

const permission = { suppressAuth: true, suppressHooks: true }

export const createCheckout = webMethod(Permissions.Anyone, async (catalogItemId, invest) => {
    try {
        let options = {
            channelType: "WEB",
            lineItems: [{
                quantity: 1,
                catalogReference: {
                    // Wix Stores appId
                    appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
                    // Wix Stores productId
                    catalogItemId: catalogItemId.productId,
                    options: { variantId: catalogItemId._id }
                },
            }, ],
        }

        if (invest) options.couponCode = "endow-back-this-beat";

        const checkoutElevate = elevate(checkout.createCheckout)
        const newCheckout = await checkoutElevate(options, permission);
        console.log("newCheckout", newCheckout)

        // GET URL
        const orderElevate = elevate(checkout.getCheckoutUrl)
        const result = await orderElevate(newCheckout._id, permission);
        console.log("result", result)
        return result;

        // CREATE ORDER
        // const order = await createOrder(newCheckout._id);
        // return order;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
});

export const createOrder = webMethod(Permissions.Anyone, async (checkoutId) => {
    try {
        const orderElevate = elevate(checkout.createOrder)
        const createOrderResponse = await orderElevate(checkoutId, permission);
        return createOrderResponse;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
});

export const getVariants = webMethod(Permissions.Anyone, async (productId) => {
    const items = await wixStoresBackend.getProductVariants(productId);

    // items.sort((a, b) => a.variant.price - b.variant.price);

    const updatedItems = items.map(item => ({
        ...item,
        productId: productId
    }));

    return updatedItems;
})

export const getDownloadBeat = webMethod(Permissions.Anyone, async (fileId) => {
    try {
        const elevateFiles = elevate(files.generateFileDownloadUrl)
        const result = await elevateFiles(fileId);
        return result.downloadUrls[0].url;
    } catch (error) { console.error(error); }
})