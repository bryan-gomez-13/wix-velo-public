import { cart } from 'wix-stores-frontend';

$w.onReady(function () {
    cart.getCurrentCart().then(async (currentCart) => {
		let items = currentCart.lineItems
        for (let i = 0; i < items.length; i++) {
            await cart.removeProduct(items[i].id)
                .catch((error) => console.error(error))
        }
    }).catch((error) => console.error(error));
});