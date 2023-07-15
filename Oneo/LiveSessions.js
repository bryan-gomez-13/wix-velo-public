import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';
import { availabilityCalendar } from 'wix-bookings.v2';

var memberID = "",
    filterDate = true,
    todayDate, newDate0, newDate1
$w.onReady(async function () {
    let date = new Date();
    $w('#date').text = date.toDateString();
    await getMember();
    init();

    bookInfo(true, "fdd9cfee-04e7-4e48-8a8c-50e5b205ee37")
});

function init() {
    $w('#dataCH').onReady(() => {
        $w('#repCH').onItemReady(async ($item, itemData, index) => {
            let nextDate = await bookInfo(filterDate, itemData.service._id)
            
            let dateNow = new Date(nextDate);
            let hour = dateNow.getHours();
            let minutes = dateNow.getMinutes();
            let period = (hour >= 12) ? "PM" : "AM";
            hour = (hour > 12) ? hour - 12 : hour;
            hour = ("0" + hour).slice(-2);
            minutes = ("0" + minutes).slice(-2);
            $item('#nextDateCH').text = "Next session "+ dateNow.toDateString() + " | " + hour + ":" + minutes + " " + period;

            if (memberID !== "") $item('#btCH').label = "Booking"
            else $item('#btCH').label = "Join Today"
            $item('#btCH').onClick(() => {
                if (memberID !== "") wixLocation.to('/booking-v2')
                else wixLocation.to('//memberships')
            })
        })
    })

    $w('#dataY').onReady(() => {
        $w('#repY').onItemReady(async ($item, itemData, index) => {
            let nextDate = await bookInfo(filterDate, itemData.service._id)
            
            let dateNow = new Date(nextDate);
            let hour = dateNow.getHours();
            let minutes = dateNow.getMinutes();
            let period = (hour >= 12) ? "PM" : "AM";
            hour = (hour > 12) ? hour - 12 : hour;
            hour = ("0" + hour).slice(-2);
            minutes = ("0" + minutes).slice(-2);
            $item('#nextDateY').text = "Next session "+ dateNow.toDateString() + " | " + hour + ":" + minutes + " " + period;

            if (memberID !== "") $item('#btY').label = "Booking"
            else $item('#btY').label = "Join Today"
            $item('#btY').onClick(() => {
                if (memberID !== "") wixLocation.to('/booking-v2')
                else wixLocation.to('//memberships')
            })
        })
    })
}

async function bookInfo(filterDate, serviceId) {
    try {
        if (filterDate) {
            todayDate = new Date();
            newDate0 = todayDate;
            newDate1 = new Date(todayDate.getFullYear(), (todayDate.getMonth() + 1), 1);
            filterDate = false;
        }

        let query = {
            "filter": {
                "serviceId": [serviceId],
                startDate: newDate0,
                endDate: newDate1
            }
        }
        let availability = await availabilityCalendar.queryAvailability(query);
        return availability.availabilityEntries[0].slot.startDate

    } catch (error) { console.log(error) }
}

async function getMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options)
        .then((member) => {
            //console.log(member)
            memberID = member._id
        }).catch((error) => {
            console.error(error);
        });
}