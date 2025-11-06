import { Permissions, webMethod } from "wix-web-module";
import wixStoresBackend from "wix-stores-backend";
import { currentCart } from "wix-ecom-backend";
import { elevate } from "wix-auth";

export const getProductVariants = webMethod(Permissions.Anyone, (productId, options) => {
    return wixStoresBackend.getProductVariants(productId, options);
})

export const myAddToCurrentCartFunction = webMethod(Permissions.Anyone, async (options) => {
    try {
        const elev_updatedCurrentCart = elevate(currentCart.addToCurrentCart);
        const updatedCurrentCart = await elev_updatedCurrentCart(options);
        return updatedCurrentCart;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
}, );