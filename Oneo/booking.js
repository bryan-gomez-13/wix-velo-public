import wixData from 'wix-data';
import wixPaidPlans from 'wix-paid-plans';
import wixWindow from 'wix-window';
import { currentMember, authentication } from 'wix-members';
import { availabilityCalendar } from 'wix-bookings.v2';

import { orders } from 'wix-pricing-plans';
import wixLocation from 'wix-location';

import { getContact, cancelBooking_V2, getSession, queryExtendedBookings_V2 } from 'backend/BookingV2.jsw'
import { getPlans } from 'backend/data.jsw'

var arraySessions = [],
    repArray = [],
    arrayS = [],
    plans = []

var services, member, contactID,
    cancel = "",
    courseAvailable, errToWixData
var todayDate, newDate0, newDate1

$w.onReady(async function () {
    let dateNow = new Date();
    var hour = dateNow.getHours();
    var minutes = dateNow.getMinutes();
    var period = (hour >= 12) ? "PM" : "AM";
    hour = (hour > 12) ? hour - 12 : hour;
    hour = ("0" + hour).slice(-2);
    minutes = ("0" + minutes).slice(-2);

    $w('#dateNow').text = dateNow.toDateString() + " | " + hour + ":" + minutes + " " + period;
    init();
    initialFunctions();
    authentication.onLogin(async (member) => initialFunctions());
});

async function init() {
    $w('#BTsessions').onClick(() => { $w('#box').changeState('session'), $w('#BTsessions').disable(), $w('#BTownSessions').enable() })
    $w('#BTownSessions').onClick(() => { $w('#box').changeState('ownSessions'), $w('#BTownSessions').disable(), $w('#BTsessions').enable() })
    $w('#goToBooking').onClick(() => { $w('#box').changeState('ownSessions'), $w('#BTownSessions').disable(), $w('#BTsessions').enable() })

    $w('#BTerrBook').onClick(async () => { errToWixData.button = "Book", await wixData.insert('Userissues', errToWixData, { suppressAuth: true }).catch(async (err) => { await wixData.insert('CatchError', { title: "Book issue Book", error: err, info: errToWixData }, { "suppressAuth": true, "suppressHooks": true }) }) })
    $w('#BTerrMyBook').onClick(async () => { errToWixData.button = "My Bookings", await wixData.insert('Userissues', errToWixData, { suppressAuth: true }).catch(async (err) => { await wixData.insert('CatchError', { title: "Book issue My Book", error: err, info: errToWixData }, { "suppressAuth": true, "suppressHooks": true }) }) })
    $w('#BTerrCancel').onClick(async () => { errToWixData.button = "Cancel", await wixData.insert('Userissues', errToWixData, { suppressAuth: true }).catch(async (err) => { await wixData.insert('CatchError', { title: "Book issue Cancel", error: err, info: errToWixData }, { "suppressAuth": true, "suppressHooks": true }) }) })

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
        //console.log(itemData.slot)
        /*
        switch (itemData.slot.serviceId) {
        case "68c11126-b710-4259-b4cd-403a5e7c4081":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/coherence-healing"
            break;
        case "c3d7eaf5-4be6-47bf-8dfc-9f7f971342aa":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/tesla-3-6-9-1"
            break;
        case "c0f437a0-2b59-4a92-b32b-302fdaa16ea9":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/silent-deeply-connected"
            break;
        case "7cb9074f-6348-4ee0-b744-65d7e8f62902":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/buddha-s-cave"
            break;
        case "b511c0bc-901e-46d6-84cb-5017a6fb40d5":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/you-2-0"
            break;
        case "7c6f073c-5405-42ac-8e85-c436b134c41c":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/shivas-tunnel"
            break;
        case "e3b7b40a-c831-409f-9302-430c1bebb548":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/unshackle"
            break;
        case "e798dbd8-52eb-463f-9e54-99754d7f4821":
            $item('#btBook').link = "https://www.oneo.love/booking-calendar/self-reflective-mirror"
            break;
        default:
            console.log('PP')
            $item('#btBook').link = "https://www.oneo.love/booking-temp"
            break;
        }
        */
        $item('#btBook').onClick(() => {
            switch (itemData.slot.serviceId) {
            case "68c11126-b710-4259-b4cd-403a5e7c4081":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/coherence-healing";
                wixLocation.to("https://www.oneo.love/booking-calendar/coherence-healing");
                break;
            case "c3d7eaf5-4be6-47bf-8dfc-9f7f971342aa":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/tesla-3-6-9-1"
                wixLocation.to("https://www.oneo.love/booking-calendar/tesla-3-6-9-1");
                break;
            case "c0f437a0-2b59-4a92-b32b-302fdaa16ea9":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/silent-deeply-connected";
                wixLocation.to("https://www.oneo.love/booking-calendar/silent-deeply-connected");
                break;
            case "7cb9074f-6348-4ee0-b744-65d7e8f62902":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/buddha-s-cave"
                wixLocation.to("https://www.oneo.love/booking-calendar/buddha-s-cave");
                break;
            case "b511c0bc-901e-46d6-84cb-5017a6fb40d5":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/you-2-0"
                wixLocation.to("https://www.oneo.love/booking-calendar/you-2-0");
                break;
            case "7c6f073c-5405-42ac-8e85-c436b134c41c":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/shivas-tunnel"
                wixLocation.to("https://www.oneo.love/booking-calendar/shivas-tunnel");
                break;
            case "e3b7b40a-c831-409f-9302-430c1bebb548":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/unshackle"
                wixLocation.to("https://www.oneo.love/booking-calendar/unshackle");
                break;
            case "e798dbd8-52eb-463f-9e54-99754d7f4821":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/self-reflective-mirror"
                wixLocation.to("https://www.oneo.love/booking-calendar/self-reflective-mirror");
                break;
            default:
                console.log('PP')
                //$item('#btBook').link = "https://www.oneo.love/booking-temp"
                wixLocation.to("https://www.oneo.love/booking-temp");
                break;
            }
        });

        if (repArray.length > 0) {
            for (let i = 0; i < repArray.length; i++) {
                if ((repArray[i].bookedEntity.slot.sessionId == itemData.slot.sessionId) && repArray[i].status == "CONFIRMED") {
                    $item('#alreadyBook').show();
                    $item('#btBook').hide();
                    $item('#goToBooking').show();
                    //$item('#btAdd').hide();
                    break;
                } else {
                    $item('#alreadyBook').hide();
                    if (courseAvailable.includes(itemData.slot.serviceId)) {
                        $item('#btBook').label = "Book";
                        $item('#btBook').enable();
                        $item('#btBook').show();
                        $item('#goToBooking').hide();
                    } else {
                        $item('#btBook').label = "Not available";
                        $item('#btBook').disable();
                        $item('#btBook').show();
                        $item('#goToBooking').hide();
                    }
                }
            }
        } else {
            if (courseAvailable.includes(itemData.slot.serviceId)) {
                $item('#btBook').label = "Book";
                $item('#btBook').enable();
                $item('#btBook').show();
                $item('#goToBooking').hide();
            } else {
                $item('#btBook').label = "Not available";
                $item('#btBook').disable();
                $item('#btBook').show();
                $item('#goToBooking').hide();
            }
        }

        $item('#repSessionDate').text = startDate.toDateString();
        $item('#repSessionHour').text = hour;
        for (let i = 0; i < services.length; i++) {
            if (itemData.slot.serviceId == services[i]._id) {
                $item('#repSessionServiceName').text = services[i].serviceName
                break
            }
        }
    })

    // ======================= Rep My Books
    $w('#repMyBooks').onItemReady(async ($item, itemData, index) => {
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

        let sessionInfo = await getSession(itemData.bookedEntity.slot.sessionId);
        $item('#mbJoinNow').link = sessionInfo.calendarConference.guestUrl;

        $item('#mbJoinNow').onClick(async () => {
            if (!($item('#mbJoinNow').link)) {
                let sessionInfo = await getSession(itemData.bookedEntity.slot.sessionId)
                wixLocation.to(sessionInfo.calendarConference.guestUrl)
            }
        })

    })

}

async function initialFunctions() {
    $w('#box').changeState('Loading')
    try {
        await getCurrentMember();

        if (member) {
            await getBookings_V2();
        }

        await getServices(true)
        await updateSessionRep()

        $w('#BTownSessions').show();
        $w('#btMaster').show();

        $w('#box').changeState('session');
        $w('#BTsessions').disable();
        $w('#BTownSessions').enable();
    } catch (error) {
        $w('#errorMessage').text = error;
        $w('#lottieEmbed2').hide();
        $w('#text298').collapse();
        $w('#errorMessage').show();
        $w('#errorButtons').expand();
    }

}
// ========================================================================== GET SERVICES & BOOKINGS
async function getServices(filterDate) {
    wixPaidPlans.getCurrentMemberOrders()
    await wixData.query("Bookings/Services").find().then(async (results) => {
        //(results.items)
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

    if (repArray.length > 0) $w('#messageOwnSessions').collapse();
    else $w('#messageOwnSessions').expand();
    //console.log("repArray", repArray)
    $w('#repMyBooks').data = repArray;
    await $w('#repMyBooks').onItemReady(async ($item, itemData, index) => {
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

        let sessionInfo = await getSession(itemData.bookedEntity.slot.sessionId);
        $item('#mbJoinNow').link = sessionInfo.calendarConference.guestUrl;

        $item('#mbJoinNow').onClick(async () => {
            if (!($item('#mbJoinNow').link)) {
                let sessionInfo = await getSession(itemData.bookedEntity.slot.sessionId)
                wixLocation.to(sessionInfo.calendarConference.guestUrl)
            }
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
            let availability = await availabilityCalendar.queryAvailability(query)
            //console.log(availability)

            for (let j = 0; j < availability.availabilityEntries.length; j++) {
                let json = availability.availabilityEntries[j]
                json.date = new Date(json.slot.startDate)
                //json.serviceID = arrayS[i]
                json._id = json.slot.sessionId;
                arraySessions.push(json)
            }
        }
        //("Array", arraySessions)

    } catch (error) {
        await wixData.insert('CatchError', { title: "Booking Page - bookInfo", error: error, info: filterDate })
        errToWixData = {
            user: member._id,
            issue: error,
            data: filterDate,
            title: "Booking Page - bookInfo"
        }
        throw error(error);
    }
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

        $item('#btBook').onClick(() => {
            switch (itemData.slot.serviceId) {
            case "68c11126-b710-4259-b4cd-403a5e7c4081":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/coherence-healing";
                wixLocation.to("https://www.oneo.love/booking-calendar/coherence-healing");
                break;
            case "c3d7eaf5-4be6-47bf-8dfc-9f7f971342aa":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/tesla-3-6-9-1"
                wixLocation.to("https://www.oneo.love/booking-calendar/tesla-3-6-9-1");
                break;
            case "c0f437a0-2b59-4a92-b32b-302fdaa16ea9":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/silent-deeply-connected";
                wixLocation.to("https://www.oneo.love/booking-calendar/silent-deeply-connected");
                break;
            case "7cb9074f-6348-4ee0-b744-65d7e8f62902":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/buddha-s-cave"
                wixLocation.to("https://www.oneo.love/booking-calendar/buddha-s-cave");
                break;
            case "b511c0bc-901e-46d6-84cb-5017a6fb40d5":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/you-2-0"
                wixLocation.to("https://www.oneo.love/booking-calendar/you-2-0");
                break;
            case "7c6f073c-5405-42ac-8e85-c436b134c41c":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/shivas-tunnel"
                wixLocation.to("https://www.oneo.love/booking-calendar/shivas-tunnel");
                break;
            case "e3b7b40a-c831-409f-9302-430c1bebb548":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/unshackle"
                wixLocation.to("https://www.oneo.love/booking-calendar/unshackle");
                break;
            case "e798dbd8-52eb-463f-9e54-99754d7f4821":
                //$item('#btBook').link = "https://www.oneo.love/booking-calendar/self-reflective-mirror"
                wixLocation.to("https://www.oneo.love/booking-calendar/self-reflective-mirror");
                break;
            default:
                console.log('PP')
                //$item('#btBook').link = "https://www.oneo.love/booking-temp"
                wixLocation.to("https://www.oneo.love/booking-temp");
                break;
            }
        });

        if (repArray.length > 0) {
            for (let i = 0; i < repArray.length; i++) {
                if ((repArray[i].bookedEntity.slot.sessionId == itemData.slot.sessionId) && repArray[i].status == "CONFIRMED") {
                    $item('#alreadyBook').show();
                    $item('#btBook').hide();
                    $item('#goToBooking').show();
                    //$item('#btAdd').hide();
                    break;
                } else {
                    $item('#alreadyBook').hide();
                    if (courseAvailable.includes(itemData.slot.serviceId)) {
                        $item('#btBook').label = "Book";
                        $item('#btBook').enable();
                        $item('#btBook').show();
                        $item('#goToBooking').hide();
                    } else {
                        $item('#btBook').label = "Not available";
                        $item('#btBook').disable();
                        $item('#btBook').show();
                        $item('#goToBooking').hide();
                    }
                }
            }
        } else {
            if (courseAvailable.includes(itemData.slot.serviceId)) {
                $item('#btBook').label = "Book";
                $item('#btBook').enable();
                $item('#btBook').show();
                $item('#goToBooking').hide();
            } else {
                $item('#btBook').label = "Not available";
                $item('#btBook').disable();
                $item('#btBook').show();
                $item('#goToBooking').hide();
            }
        }

        $item('#repSessionDate').text = startDate.toDateString();
        $item('#repSessionHour').text = hour;
        for (let i = 0; i < services.length; i++) {
            if (itemData.slot.serviceId == services[i]._id) {
                $item('#repSessionServiceName').text = services[i].serviceName
                break
            }
        }
    })
}

// ========================================================================== CANCEL BOOK
async function cancelBooking(book) {
    $w('#group5').scrollTo();
    $w('#box').changeState('Loading')

    try {
        await cancelBooking_V2(book)
        await getBookings_V2();

        await getCurrentMember();
        await bookInfo(false);
        await updateSessionRep();

        $w('#box').changeState('ownSessions');
        $w('#BTsessions').enable();
        $w('#BTownSessions').disable();
    } catch (error) {
        $w('#errorMessage').text = error;
        $w('#lottieEmbed2').hide();
        $w('#text298').collapse();
        $w('#errorMessage').show();
        $w('#errorButtons').expand();
    }
    //console.log(book)
}

// ========================================================================== GET MEMBER
async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (memberInfo) => {
        member = memberInfo;

        if (member == undefined) {
            $w('#group5').collapse();
            $w('#box1').collapse();
        } else {
            $w('#group5').expand();
            $w('#box1').expand();
        }

    })

    if (member) {
        contactID = await getContact(member.loginEmail, false)
        // Get plans already booked and stay active
        await orders.listCurrentMemberOrders()
            .then(async (ordersList) => {
                let planSearch = []
                for (let i = 0; i < ordersList.length; i++) {
                    if (ordersList[i].status == "ACTIVE") plans.push(ordersList[i]), planSearch.push(ordersList[i].planId)
                }
                /*
                if (planSearch.includes('70fa5386-2d93-4646-b131-6e8774e60514')) $w('#btCH14').expand();
                else $w('#btCH14').collapse();

                if (planSearch.includes('6d87f421-244f-4cfb-9021-23fcc596c70e')) $w('#btCH24').expand();
                else $w('#btCH24').collapse();
                */
                courseAvailable = await getPlans(planSearch)
                console.log("plans", plans)
                //console.log("courseAvailable", courseAvailable)
                await repPlans(plans)

            }).catch(async (error) => {
                await wixData.insert('CatchError', { title: "Booking Page - getCurrentMember", error: error, info: plans })
                console.error(error)
                errToWixData = {
                    user: member._id,
                    issue: error,
                    data: plans,
                    title: "Booking Page - bookInfo"
                }
                throw error(error);
            })
    }
}

async function repPlans(arrayPlans) {
    if (arrayPlans.length == 0) $w('#selectM').expand();
    else $w('#selectM').collapse();

    $w('#repPlans').data = arrayPlans
    $w('#repPlans').onItemReady(($item, itemData, index) => {
        /*
        if (variable) {
            if (itemData.plan == "6d87f421-244f-4cfb-9021-23fcc596c70e") $w('#button18').show(), variable = false
            else $w('#button18').show() //Bryan por ahora cambien que siempre se muestre el boton de audios
        }
        */

        $item('#planName').text = itemData.planName

        let dateS = new Date(itemData.startDate)
        $item('#startDate').text = "Start date: " + dateS.toDateString();
        let dateL = new Date(itemData.currentCycle.startedDate)
        $item('#lastPayment').text = "Last Payment: " + dateL.toDateString();
        if (itemData.cancellation) {
            let dateN = new Date(itemData.currentCycle.endedDate)
            $item('#nextPayment').text = "End Membership: " + dateN.toDateString();
            $item('#planBTCancel').collapse();
        } else {
            let dateN = new Date(itemData.currentCycle.endedDate)
            $item('#nextPayment').text = "Next Payment: " + dateN.toDateString();
            $item('#planBTCancel').expand();
        }

        $item('#planBTCancel').onClick(() => {
            itemData.privateId = member;
            wixWindow.openLightbox("CancelSubscription", itemData)
        })
    })
    $w('#repPlans').expand();
}