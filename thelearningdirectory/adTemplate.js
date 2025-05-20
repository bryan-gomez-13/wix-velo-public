import { orders } from 'wix-pricing-plans-frontend';
import { updateTemplate } from 'backend/collections.web.js'
import { cancelOrders } from 'backend/functions.web.js';
import wixWindowFrontend from 'wix-window-frontend';
import wixLocationFrontend from 'wix-location-frontend';

var ordersWix;
// PlansIds
var freeTrial = "3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4";
var standardAdStartDate = "3bbb3d86-e37d-46e8-b7fe-b2357b08a55c";
var standardAdByAppointment = "206f9520-8619-468c-90ef-190798511246";

$w.onReady(async function () {
    init()

    orders.listCurrentMemberOrders().then((orderPlans) => {
        ordersWix = orderPlans;
        const activeOrders = ordersWix.filter(order => order.status === "ACTIVE");
        const plansActive = activeOrders.filter(order => [freeTrial, standardAdStartDate, standardAdByAppointment].includes(order.planId))
            .map(({ planName, _id }) => ({ label: planName, value: _id }));
        if (plansActive.length > 0) $w('#box').changeState("adTemplate");
        else $w('#box').changeState("dontPlan");
        $w('#dropPlans').options = plansActive;
    }).catch((err) => { console.log(err) });
})

function init() {
    $w('#dateCourse').onChange(() => {
        if ($w('#dateCourse').checked) {
            $w('#gDate').expand();
            $w('#startDate').required = true;
            $w('#endDate').required = true;
            $w('#startTime').required = true;
            $w('#endTime').required = true;

            $w('#gAppointment').collapse();
            $w('#gAppointment').required = false;
        } else {
            $w('#gDate').collapse();
            $w('#startDate').required = false;
            $w('#endDate').required = false;
            $w('#startTime').required = false;
            $w('#endTime').required = false;

            $w('#gAppointment').expand();
            $w('#gAppointment').required = true;
        }
    })

    $w('#submit').onClick(() => {
        $w('#saveTemplate').save().then((saveItem) => {
            let plan = $w('#dropPlans').value;
            const planName = ordersWix.find((item) => item._id == plan);
            const planId = planName.planId;
            var dknow = new Date();

            // ============================ FREE launch promo   
            if (planId == freeTrial) {
                dknow.setMonth(dknow.getMonth() + 1); //MONTH
                // ============================ standard Ad StartDate
            } else if ((planId == standardAdStartDate)) {
                dknow.setMonth(dknow.getMonth() + 2);
                // ============================ standard Ad By Appointment
            } else if (planId == standardAdByAppointment) {
                dknow.setDate(dknow.getDate() + 70); //DAYS
            }

            const url = slugify(saveItem.title);

            const json = {
                "_id": saveItem._id,
                "startTime": $w("#startTime").value,
                "finalTime": $w("#endTime").value,
                "plan": plan,
                "dateFinalCourse": dknow,
                "planName": planName.planName,
                "metaTitle": saveItem.title,
                "metaDescription": saveItem.largeDescription,
                "urlSlug": url
            }

            updateTemplate(json);
            cancelOrders(plan);
        })

        wixWindowFrontend.openLightbox("thanksPost").then(() => wixLocationFrontend.to("/"))
    })
}

function slugify(text) {
    return text
        .toLowerCase()
        .normalize("NFD") // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .trim() // remove leading/trailing whitespace
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-') // collapse multiple hyphens
        .replace(/^-+|-+$/g, ''); // remove hyphens from start/end

}