import wixData from 'wix-data';
import wixPaidPlans from 'wix-paid-plans';
import { currentMember, authentication } from 'wix-members';
import { availabilityCalendar } from 'wix-bookings.v2';

import { orders } from 'wix-pricing-plans';
//import { orders } from 'wix-pricing-plans.v2';

import wixLocation from 'wix-location';
//import wixPricingPlans from 'wix-pricing-plans.v2';

import { getContact, bookSlot_Back, cancelBooking_V2, getSession, queryExtendedBookings_V2 } from 'backend/BookingV2.jsw'
import { getPlans, getMembership, getPlanByBooking, getRemingCourse } from 'backend/data.jsw'

var arraySessions = [],
    repArray = [],
    arrayS = [],
    arrayPlans = [],
    arrayRemind = [],
    plans = []

var services, member, contactID, slot = "",
    cancel = "",
    courseAvailable
var todayDate, newDate0, newDate1

$w.onReady(async function () {
    let dateNow = new Date();
    $w('#dateNow').text = dateNow.toDateString();
    init();
    initialFunctions();
    authentication.onLogin(async (member) => initialFunctions());
});

async function init() {
    $w('#BTsessions').onClick(() => { $w('#box').changeState('session'), $w('#BTsessions').disable(), $w('#BTownSessions').enable() })
    $w('#BTownSessions').onClick(() => { $w('#box').changeState('ownSessions'), $w('#BTownSessions').disable(), $w('#BTsessions').enable() })

    // ======================= Buttons function about next month and last month
    $w('#lastMonth').onClick(async () => {
        newDate0.setMonth((newDate0.getMonth() - 1))
        newDate1.setMonth((newDate1.getMonth() - 1))

        if ((todayDate.getMonth() == newDate0.getMonth()) && (todayDate.getFullYear() == newDate0.getFullYear())) {
            $w('#lastMonth').disable();
            newDate0 = todayDate;
            newDate1 = new Date(newDate0.getFullYear(), (newDate0.getMonth() + 1), 1);
        }

        $w('#box').changeState('Loading')
        await bookInfo(false)
        await updateSessionRep()

        $w('#box').changeState('session');
        $w('#BTsessions').disable();
        $w('#BTownSessions').enable();
    })

    $w('#nextMonth').onClick(async () => {
        if (!($w('#lastMonth').enabled)) $w('#lastMonth').enable();
        newDate0 = new Date(newDate1);
        newDate1.setMonth((newDate1.getMonth() + 1));

        $w('#box').changeState('Loading')
        await bookInfo(false)
        await updateSessionRep()

        $w('#box').changeState('session');
        $w('#BTsessions').disable();
        $w('#BTownSessions').enable();
    })

    // ======================= Rep Sessions
    $w('#repSessions').onItemReady(async ($item, itemData, index) => {
        let startDate = new Date(itemData.slot.startDate)
        let endDate = new Date(itemData.slot.endDate)
        let hour = startDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let difference = endDate - startDate;
        let DHours = Math.floor(difference / 3600000);
        let DMinutes = Math.round((difference % 3600000) / 60000);
        if (DHours == 0) $item('#repSessionTimeSlots').text = DMinutes + " min | " + itemData.openSpots + " spots available"
        else {
            if (DMinutes == 0) $item('#repSessionTimeSlots').text = DHours + " h | " + itemData.openSpots + " spots available"
            else $item('#repSessionTimeSlots').text = DHours + " h " + DMinutes + " min | " + itemData.openSpots + " spots available"
        }
        let showBo = true
        for (let i = 0; i < repArray.length; i++) {
            if ((repArray[i].bookedEntity.slot.sessionId == itemData.slot.sessionId) && repArray[i].status == "CONFIRMED") {
                $item('#alreadyBook').show();
                $item('#bookNow').collapse();
                $item('#alreadyBooked').expand();
                showBo = false
                break;
            } else {
                $item('#bookNow').expand();
                $item('#alreadyBook').hide();
                $item('#alreadyBooked').collapse();
            }
        }
        //if (showBo) $item('#alreadyBook').hide(), $item('#bookNow').enable();

        if (member) {
            $w('#bookNow').show();
            if (courseAvailable.includes(itemData.slot.serviceId)) {
                $item('#bookNow').label = "Book now";
                let remind = false
                if (arrayRemind.length > 0) {
                    for (let i = 0; i < arrayRemind.length; i++) {
                        remind = await getRemingCourse(itemData.slot.serviceId, arrayRemind[i])
                    }
                    if (remind) $item('#bookNow').disable();
                }
                if (showBo) {
                    $item('#alreadyBook').hide();
                    if (remind == false) $item('#bookNow').enable();
                }

            } else {
                $item('#bookNow').label = "Not available";
                $item('#alreadyBook').hide();
                $item('#bookNow').disable();
            }
        } else $w('#bookNow').hide();

        $item('#repSessionDate').text = startDate.toDateString();
        $item('#repSessionHour').text = hour;
        for (let i = 0; i < services.length; i++) {
            if (itemData.slot.serviceId == services[i]._id) {
                $item('#repSessionServiceName').text = services[i].serviceName
                break
            }
        }

        $w('#alreadyBooked').onClick(() => { $w('#box').changeState('ownSessions'), $w('#BTownSessions').disable(), $w('#BTsessions').enable() })

        $item('#bookNow').onClick(() => {
            let date = new Date(itemData.slot.startDate)
            if (date.getMonth() == newDate0.getMonth()) {
                if (slot == "" || (slot !== itemData.slot.sessionId)) {
                    slot = itemData.slot.sessionId
                    $item('#bookNow').disable();
                    createBook(itemData, member, services);
                    $item('#bookNow').enable();
                }
            }
        })
    })
    // ======================= Rep My Books
    $w('#repMyBooks').onItemReady(($item, itemData, index) => {
        //console.log(itemData)
        let startDate = new Date(itemData.startDate)
        let endDate = new Date(itemData.endDate)
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
            if (cancel == "" || (cancel !== itemData._id)) {
                cancel = itemData._id
                cancelBooking(itemData)
            }
        })

        $item('#mbJoinNow').onClick(async () => {
            let sessionInfo = await getSession(itemData.bookedEntity.slot.sessionId)
            wixLocation.to(sessionInfo.calendarConference.guestUrl)
        })
    })

}

async function initialFunctions() {
    $w('#box').changeState('Loading')
    await getCurrentMember()

    if (member) {
        await getBookings_V2()
        $w('#BTownSessions').show();
    } else $w('#BTownSessions').hide();

    await getServices(true)
    await updateSessionRep()

    $w('#box').changeState('session');
    $w('#BTsessions').disable();
    $w('#BTownSessions').enable();
}
// ========================================================================== GET SERVICES & BOOKINGS
async function getServices(filterDate) {
    wixPaidPlans.getCurrentMemberOrders()
    await wixData.query("Bookings/Services").find().then(async (results) => {
        console.log(results.items)
        services = results.items;
        for (let i = 0; i < services.length; i++) {
            arrayS.push(services[i]._id)
        }
        await bookInfo(filterDate)
    });
}

// ======================= Get My Bookings V2
async function getBookings_V2() {
    let result = await queryExtendedBookings_V2(contactID._id)
    repArray = []
    let arrayResults = result.extendedBookings
    for (let i = 0; i < arrayResults.length; i++) {
        repArray.push(arrayResults[i].booking)
    }

    await repArray.sort(function (a, b) {
        return a.startDate - b.startDate
    });

    $w('#repMyBooks').data = repArray;
    $w('#repMyBooks').onItemReady(($item, itemData, index) => {
        //console.log(itemData)
        let startDate = new Date(itemData.startDate)
        let endDate = new Date(itemData.endDate)
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
            if (cancel == "" || (cancel !== itemData._id)) {
                cancel = itemData._id
                cancelBooking(itemData)
            }
        })

        $item('#mbJoinNow').onClick(async () => {
            let sessionInfo = await getSession(itemData.bookedEntity.slot.sessionId)
            wixLocation.to(sessionInfo.calendarConference.guestUrl)
        })
    })

}

// ========================================================================== GET AVAILABLES BOOKING V2
async function bookInfo(filterDate) {
    try {
        if (filterDate) {
            todayDate = new Date();
            newDate0 = todayDate;
            newDate1 = new Date(todayDate.getFullYear(), (todayDate.getMonth() + 1), 1);
        }

        $w('#month').text = newDate0.toLocaleString('en', { month: 'long' });
        if ($w('#month').hidden) $w('#month').show();

        arraySessions = []
        //console.log(arrayS)
        for (let i = 0; i < arrayS.length; i++) {
            let query = {
                "filter": {
                    "serviceId": [arrayS[i]],
                    startDate: newDate0,
                    endDate: newDate1
                }
            }
            //console.log(query)
            let availability = await availabilityCalendar.queryAvailability(query);
            //console.log("availability: ")
            //console.log(availability)

            for (let j = 0; j < availability.availabilityEntries.length; j++) {
                let json = availability.availabilityEntries[j]
                json.date = new Date(json.slot.startDate)
                //json.serviceID = arrayS[i]
                json._id = (j + arraySessions.length) + ""
                arraySessions.push(json)
            }
        }

    } catch (error) { console.error(error) }
}

// ========================================================================== REP AVAILABLES BOOKS
async function updateSessionRep() {
    arraySessions.sort((a, b) => a.date - b.date);

    $w('#repSessions').data = arraySessions;
    $w('#repSessions').forEachItem(async ($item, itemData, index) => {
        let startDate = new Date(itemData.slot.startDate)
        let endDate = new Date(itemData.slot.endDate)
        let hour = startDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let difference = endDate - startDate;
        let DHours = Math.floor(difference / 3600000);
        let DMinutes = Math.round((difference % 3600000) / 60000);
        if (DHours == 0) $item('#repSessionTimeSlots').text = DMinutes + " min | " + itemData.openSpots + " spots available"
        else {
            if (DMinutes == 0) $item('#repSessionTimeSlots').text = DHours + " h | " + itemData.openSpots + " spots available"
            else $item('#repSessionTimeSlots').text = DHours + " h " + DMinutes + " min | " + itemData.openSpots + " spots available"
        }
        let showBo = true
        for (let i = 0; i < repArray.length; i++) {
            if ((repArray[i].bookedEntity.slot.sessionId == itemData.slot.sessionId) && repArray[i].status == "CONFIRMED") {
                $item('#alreadyBook').show();
                $item('#bookNow').collapse();
                $item('#alreadyBooked').expand();
                showBo = false
                break;
            } else {
                $item('#bookNow').expand();
                $item('#alreadyBook').hide();
                $item('#alreadyBooked').collapse();
            }
        }
        //if (showBo) $item('#alreadyBook').hide(), $item('#bookNow').enable();

        if (member) {
            $w('#bookNow').show();
            if (courseAvailable.includes(itemData.slot.serviceId)) {
                $item('#bookNow').label = "Book now";
                let remind = false
                if (arrayRemind.length > 0) {
                    for (let i = 0; i < arrayRemind.length; i++) {
                        remind = await getRemingCourse(itemData.slot.serviceId, arrayRemind[i])
                    }
                    if (remind) $item('#bookNow').disable();
                }
                if (showBo) {
                    $item('#alreadyBook').hide();
                    if (remind == false) $item('#bookNow').enable();
                }

            } else {
                $item('#bookNow').label = "Not available";
                $item('#alreadyBook').hide();
                $item('#bookNow').disable();
            }
        } else $w('#bookNow').hide();

        $item('#repSessionDate').text = startDate.toDateString();
        $item('#repSessionHour').text = hour;
        for (let i = 0; i < services.length; i++) {
            if (itemData.slot.serviceId == services[i]._id) {
                $item('#repSessionServiceName').text = services[i].serviceName
                break
            }
        }

        $w('#alreadyBooked').onClick(() => { $w('#box').changeState('ownSessions'), $w('#BTownSessions').disable(), $w('#BTsessions').enable() })

        $item('#bookNow').onClick(() => {
            let date = new Date(itemData.slot.startDate)
            if (date.getMonth() == newDate0.getMonth()) {
                if (slot == "" || (slot !== itemData.slot.sessionId)) {
                    slot = itemData.slot.sessionId
                    $item('#bookNow').disable();
                    createBook(itemData, member, services);
                    $item('#bookNow').enable();
                }
            }
        })
    })
}

async function createBook(itemData, member, services) {
    $w('#group5').scrollTo();
    $w('#box').changeState('Loading')
    //console.log(itemData, member, services)

    let result = await bookSlot_Back(itemData, member, services);
    console.log(itemData.slot.serviceId, arrayPlans)
    let planData = await getPlanByBooking(itemData.slot.serviceId, arrayPlans)
    console.log("planData", planData)
    await getMembership(member._id, planData, true, 'L')

    if (member) await getBookings_V2()
    await getCurrentMember();
    await bookInfo(false);
    await updateSessionRep();

    $w('#box').changeState('session');
    $w('#BTsessions').disable();
    $w('#BTownSessions').enable();
}

// ========================================================================== CANCEL BOOK
async function cancelBooking(book) {
    $w('#group5').scrollTo();
    $w('#box').changeState('Loading')
    //console.log(book)

    let result = await cancelBooking_V2(book)
    console.log(book.bookedEntity.slot.serviceId, arrayPlans)
    let planData = await getPlanByBooking(book.bookedEntity.slot.serviceId, arrayPlans)
    console.log("planData", planData)
    await getMembership(member._id, planData, true, 'M')

    if (member) await getBookings_V2()
    await getCurrentMember();
    await bookInfo(false);
    await updateSessionRep();

    $w('#box').changeState('ownSessions');
    $w('#BTsessions').enable();
    $w('#BTownSessions').disable();
}

// ========================================================================== GET MEMBER
async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (memberInfo) => {
        member = memberInfo
        //console.log(member)
    })

    if (member) {
        contactID = await getContact(member.loginEmail, false)
        await orders.listCurrentMemberOrders()
            .then(async (ordersList) => {
                let planSearch = []
                for (let i = 0; i < ordersList.length; i++) {
                    if (ordersList[i].status == "ACTIVE") plans.push(ordersList[i]), planSearch.push(ordersList[i].planId)
                }
                console.log("plans", plans)
                await repPlans(plans)
                console.log("planSearch", planSearch)
                courseAvailable = await getPlans(planSearch)
                console.log("courseAvailable", courseAvailable)
            }).catch((error) => console.error(error));
    }
}

async function repPlans(plans) {
    arrayPlans = [];
    for (let i = 0; i < plans.length; i++) {
        //console.log(i)
        let json = plans[i]
        //console.log('json0',json)
        let info = await getMembership(member._id, plans[i].planId, false)
        //console.log("info", info)
        json.sessions = info.sessions;
        json.remindSessions = info.remindSessions;

        if (info.remindSessions == 0) arrayRemind.push(plans[i].planId)
        //console.log('json1', json)
        arrayPlans.push(json)
    }
    console.log(arrayPlans)
    console.log("arrayRemind", arrayRemind)

    $w('#repPlans').data = arrayPlans
    $w('#repPlans').onItemReady(($item, itemData, index) => {
        $item('#planName').text = itemData.planName
        $item('#planRemaining').html = '<p class="p1 wixui-rich-text__text" style="font-size:15px;"><span class="color_12 wixui-rich-text__text"><span style="font-size:15px;" class="wixui-rich-text__text">Sessions remaining this month:</span></span></p><p class="p1 wixui-rich-text__text" style="font-size:15px;"><span style="font-weight:bold;" class="wixui-rich-text__text"><span class="color_23 wixui-rich-text__text"><span style="font-size:15px;" class="wixui-rich-text__text">' + itemData.remindSessions + "/" + itemData.sessions + '&nbsp;</span></span></span></p>'
        $item('#planBTCancel').onClick(() => {
            console.log(itemData)
        })
    })
    $w('#repPlans').expand();
}