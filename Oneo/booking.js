import wixBookings from 'wix-bookings';
import wixData from 'wix-data';
import wixPaidPlans from 'wix-paid-plans';
import { currentMember } from 'wix-members';

import { availabilityCalendar } from 'wix-bookings.v2';

var arraySessions = [],
    services, member

$w.onReady(async function () {
    bookInfo2()
    initialFunctions();
    init();

});

async function init() {
    $w('#BTsessions').onClick(() => $w('#box').changeState('session'))
    $w('#BTownSessions').onClick(() => $w('#box').changeState('ownSessions'))
}

async function initialFunctions() {
    await getServices()
    await updateSessionRep()
    await getCurrentMember()
}

async function getServices() {
    wixPaidPlans.getCurrentMemberOrders()
    await wixData.query("Bookings/Services").find().then(async (results) => {
        console.log(results.items)
        services = results.items;
        for (let i = 0; i < results.items.length; i++) {
            await bookInfo(results.items[i]._id)
        }
    });
}

async function getBookings_V1() {
    console.log(contactID)
    let arrayBook = await queryBookingsSS(contactID)
    await arrayBook.sort(function (a, b) {
        return a.bookedEntity.singleSession.start - b.bookedEntity.singleSession.start;
    });

    $w('#repMyBooks').data = arrayBook
    $w('#repMyBooks').onItemReady(($item, itemData, index) => {
        let startDate = new Date(itemData.bookedEntity.singleSession.start)
        let endDate = new Date(itemData.bookedEntity.singleSession.end)
        let hour = startDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let difference = endDate - startDate;
        let DHours = Math.floor(difference / 3600000);
        let DMinutes = Math.round((difference % 3600000) / 60000);
        if (DHours == 0) $item('#repMyBookTimeSlot').text = DMinutes + " min | " + "Status " + itemData.status
        else {
            if (DMinutes == 0) $item('#repMyBookTimeSlot').text = DHours + " h | " + "Status " + itemData.status
            else $item('#repMyBookTimeSlot').text = DHours + " h " + DMinutes + " min | " + "Status " + itemData.status
        }

        $item('#repMyBookDate').text = startDate.toDateString();
        $item('#repMyBookHour').text = hour;
        $item('#repMyBookServiceName').text = itemData.bookedEntity.title

        $item('#cancelMyBook').onClick(() => {
            cancelBooking(itemData)
        })
    })
    $w('#repMyBooks').show();
}

async function bookInfo(serviceId) {
    let startRange = new Date();
    let endRange = new Date(startRange.getFullYear(), (startRange.getMonth() + 1), 1);
    let options = {
        startDateTime: startRange,
        endDateTime: endRange
    };

    await wixBookings.getServiceAvailability(serviceId, options)
        .then((availability) => {
            console.log(availability)
            for (let i = 0; i < availability.slots.length; i++) {
                arraySessions.push(availability.slots[i])
            }
        });
}

// ========================================================================== BOOKING V2
async function bookInfo2() {
    try {
        let startRange = new Date();
        let endRange = new Date(startRange.getFullYear(), (startRange.getMonth() + 1), 1);
        let options = {
            startDateTime: startRange,
            endDateTime: endRange
        };
        let query = {
            "request-id": "a7100ead-4b13-4798-85f0-e5aeeb925824",
            "filter": options
        }
        let result = await availabilityCalendar.queryAvailability(query);
        console.log("result", result)
        return result;
    } catch (error) {
        console.error(error);
    }
}

async function updateSessionRep() {
    $w('#loading').show();
    console.log(arraySessions)

    await arraySessions.sort(function (a, b) {
        return a.startDateTime - b.startDateTime;
    });

    $w('#repSessions').data = arraySessions;
    $w('#repSessions').onItemReady(($item, itemData, index) => {
        //console.log(itemData)
        let hour = itemData.startDateTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let difference = itemData.endDateTime - itemData.startDateTime;
        let DHours = Math.floor(difference / 3600000);
        let DMinutes = Math.round((difference % 3600000) / 60000);
        if (DHours == 0) $item('#repSessionTimeSlots').text = DMinutes + " min | " + itemData.remainingSpots + " spots available"
        else {
            if (DMinutes == 0) $item('#repSessionTimeSlots').text = DHours + " h | " + itemData.remainingSpots + " spots available"
            else $item('#repSessionTimeSlots').text = DHours + " h " + DMinutes + " min | " + itemData.remainingSpots + " spots available"
        }

        $item('#repSessionDate').text = itemData.startDateTime.toDateString();
        $item('#repSessionHour').text = hour;
        for (let i = 0; i < services.length; i++) {
            if (itemData.serviceId == services[i]._id) {
                $item('#repSessionServiceName').text = services[i].serviceName
                break
            }
        }

        $item('#bookNow').onClick(() => bookSlot(itemData))
    })
    $w('#loading').hide();
    $w('#repSessions').show();
}

async function bookSlot(slot) {
    console.log(slot)
    let formFields = []
    for (let i = 0; i < services.length; i++) {
        if (slot.serviceId == services[i]._id) {
            for (let j = 0; j < services[i].form.fields.length; j++) {
                let json = {}
                if (services[i].form.fields[j].label == "Email") json._id = services[i].form.fields[j]._id, json.value = member.loginEmail
                else if (services[i].form.fields[j].label == "Name") json._id = services[i].form.fields[j]._id, json.value = member.contactDetails.firstName + " " + member.contactDetails.lastName
                else if (services[i].form.fields[j].label == "Phone Number" && member.contactDetails.phones.length > 0) json._id = services[i].form.fields[j]._id, json.value = member.contactDetails.phones[0]
                formFields.push(json)
            }

            break;
        }
    }
    formFields.pop()

    let bookingInfo = {
        "slot": slot,
        "formFields": formFields
    };

    let options = {
        "paymentType": "membership"
    }

    console.log(bookingInfo, options)

    await wixBookings.checkoutBooking(bookingInfo, options)
        .then((results) => {
            $w("#message").text = `Booking ID: ${results.bookingId} Status: ${results.status}`;
            setTimeout(() => $w('#message').text = "Live Sessions Bookings", 3000);
        }).catch((err) => console.log(err))

}

async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (memberInfo) => {
        member = memberInfo
    })
}