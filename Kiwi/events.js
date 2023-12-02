import wixData from 'wix-data';

export async function wixBookings_onBookingConfirmed(event) {
    console.log('Booking')
    let options = {
        "suppressAuth": true,
        "suppressHooks": true
    };
    console.log("Event", event)

    let array = event.booking.bookedEntity.title.split(' ')
    let title = array[0].toUpperCase()
    let contactId = event.booking.formInfo.contactDetails.contactId
    //console.log(title, contactId)
    let location = await wixData.query('Locations').eq("title", title).find().then((results) => { return results.items[0] });
    //console.log(location)

    let email = await wixData.query('Members/PrivateMembersData').eq("_id", contactId).find(options).then((results) => { return results.items[0] });
    //console.log(email)

    let member = await wixData.query('Members').eq("privateId", contactId).find().then((results) => {
        if (results.items.length > 0) return results.items[0]
        else return false
    });

    if (member !== false) {
        console.log("Old")
        await wixData.insertReference("Members", "services", member._id, location._id, options)
            .catch((error) => console.log(error));
    } else {
        let json = {
            privateId: contactId,
            email: email.loginEmail
        }
        //console.log("json", json)
        await wixData.insert("Members", json, options).then(async (item) => {
                console.log("New")
                await wixData.insertReference("Members", "services", item._id, location._id, options)
                    .catch((error) => console.log(error));
            })
            .catch((err) => console.log(err));
    }
}

export function wixStores_onNewOrder(event) {
    const newOrderId = event.orderId;
    console.log("Event", event)
    console.log("Store Id", newOrderId)

    // Get the new order's line items from the Stores/Orders collection
    const orderLineItems = wixData.get("Stores/Orders", newOrderId)
        .then((results) => {
            console.log("Order", results.lineItems)
            return results
        })
        .catch((error) => {
            // Order not found in the Stores/Orders collection
            console.error(error);
        });
}