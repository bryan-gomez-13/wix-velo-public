import { cart } from 'wix-stores-frontend';
import { currentMember } from 'wix-members';
import { getReference } from 'backend/data.jsw'
import wixData from 'wix-data';

var reference = []

$w.onReady(async function () {
    await getUser();
    getCart();
    cart.onChange(async () => {
        $w('#shoppingCart1').hide();
        await getUser();
        getCart();
    });

});

async function getCart() {
    cart.getCurrentCart()
        .then(async (currentCart) => {
            let eleM = ""
            let refM = ""

            await wixData.query('BlockMessages').find().then((results) => {
                let items = results.items
                for (let i = 0; i < items.length; i++) {
                    if (items[i]._id == "03edd352-c75f-4f08-9146-9f1bd9342458") eleM = items[i].message
                    if (items[i]._id == "e85c70b7-f482-499b-98d7-ab4a972033b8") refM = "\n\n" + items[i].message
                }
            }).catch((err) => console.log(err))

            let elements = ""
            let ref = ""
            //console.log(currentCart.lineItems)
            // Repeated elements
            let items = currentCart.lineItems
            for (let i = 0; i < items.length; i++) {
                let arrayI = items[i].name.split(' ');
                let nameI = arrayI[0]
                for (let j = 0; j < items.length; j++) {
                    let arrayO = items[j].name.split(' ');
                    let nameO = arrayO[0]
                    if (nameI == nameO && i !== j && items[i].name.includes('Accommodation')) {
                        if (!(elements.includes(items[i].name))) elements += "\n-" + items[i].name
                    }
                }
            }

            if (reference !== undefined) {
                for (let i = 0; i < items.length; i++) {
                    let arrayI = items[i].name.split(' ');
                    let nameI = arrayI[0].toUpperCase();
                    for (let j = 0; j < reference.length; j++) {
                        console.log(reference[j].title == nameI, reference[j].title, nameI)
                        if (reference[j].title == nameI && items[i].name.includes('Accommodation')) {
                            if (!(ref.includes(nameI))) ref += "\n-" + nameI
                        }
                    }
                }
            }
            let message = "";
            if (ref !== "" || elements !== "") {
                if (elements !== "") message = eleM + elements
                if (ref !== "") message += refM + ref
                $w('#info').text = message;
                $w('#box1').expand();
            } else {
                $w('#box1').collapse();
            }

            $w('#shoppingCart1').show();
        })
        .catch((error) => {
            console.error(error);
        });
}

async function getUser() {
    await currentMember.getMember().then(async (member) => {
        let memberId = member._id;
        reference = await getReference(memberId)
        console.log("R", reference)
    }).catch((error) => console.log(error));
}