import { createMyPayment, appendValuesWrapper } from 'backend/functions.web.js';
import { generalQuery, saveData, updateCollection, lessOneLvL2 } from 'backend/collections.web.js';
import { sendEmailNotifications } from 'backend/emails.web.js';
import wixLocationFrontend from 'wix-location-frontend';
import wixPayFrontend from "wix-pay-frontend";

let dogsNameCheck = true;
let lvl2Price, itemLvl2Monday, itemLvl2Tuesday;

var courseIdM = '947f56a4-a236-47b1-a9df-c7f71e170886';
var courseIdT = '71322720-ea65-4ed6-9163-f1643e4d1f4b';
var collectionId = 'Level2Training';
let googleSheet = 'sheetLvL2';
let courseInfo;

$w.onReady(function () {
    getLvL2Info();
    init();
});

function init() {
    $w("#form1").onFieldValueChange((newValues) => {
        if (newValues["email_d952"] && dogsNameCheck) {
            generalQuery("Training", "email", newValues["email_d952"]).then((result) => {
                if (result.length > 0) {
                    dogsNameCheck = false;

                    let phone = (result[0].phone) ? parseInt(result[0].phone) : '';

                    if (result[0].phone)
                        $w('#form1').setFieldValues({
                            dogs_name: result[0].dogsName,
                            dogs_bread: result[0].dogsBreed,
                            dog_lvl_1: true,
                            phone: phone
                        })
                }
            })
        }

        if (newValues["prefered_day"]) {
            const isMonday = newValues["prefered_day"] === "Monday";
            if (isMonday) {
                $w('#title').html = itemLvl2Monday.formEnabledMessage;
            } else {
                $w('#title').html = itemLvl2Tuesday.formEnabledMessage;
            }

            const isFull = isMonday ? itemLvl2Monday.remainingSpots <= 0 : itemLvl2Tuesday.remainingSpots <= 0;
            const alternativeDay = isMonday ? "Tuesday" : "Monday";

            if (isFull) {
                $w('#messageFull').text = `The ${newValues["prefered_day"]} you selected is already full. Please choose another one.`;
                $w('#messageFull').expand();
                $w('#form1').setFieldValues({ prefered_day: alternativeDay });
            }
        }
    });

    $w('#btSubmit').onClick(async () => {
        const event = $w("#form1").getFieldValues();

        // let phone = (event.phone) ? parseInt(event.phone) : '';
        // if (event.phone) $w('#form1').setFieldValues({ phone: phone })

        if (event.first_name !== null && event.last_name !== null && event.email_d952 !== null && event.phone !== null && event.dogs_name !== null && event.dogs_bread !== null && event.prefered_day !== null && event.dog_lvl_1 !== false && event.form_field_0acf !== false) {
            let courseIdSearch

            if (event.prefered_day == 'Monday') {
                courseIdSearch = courseIdM;
            } else if (event.prefered_day == 'Tuesday') {
                courseIdSearch = courseIdT;
            }

            courseInfo = (await generalQuery('Course', '_id', courseIdSearch))[0];

            // If no spots available, disable button and show message
            if (courseInfo.remainingSpots <= 0) {
                await getLvL2Info(event.prefered_day);
                return;
            }

            $w("#form1").submit();

            const phone = `${event.phone}`
            $w('#boxLvl2').changeState("lvl2Pay");
            $w('#boxLvl2').scrollTo();

            let jsonToSaveLvL2 = {
                firstName: event.first_name,
                lastName: event.last_name,
                email: event.email_d952,
                phone: phone,
                dogsName: event.dogs_name,
                dogsBread: event.dogs_bread,
                preferedDay: event.prefered_day,
                checkLvl1: "Checked",
                cancellationPolicy: "Checked",
                paymentStatus: "Pending"
            }

            // Save submission to database
            let trainingSubmission = await saveData(collectionId, jsonToSaveLvL2);

            // Reduce available spots
            const status = await lessOneLvL2(courseIdSearch, collectionId, 'payment', event.prefered_day);

            // Create payment session
            const paymentSession = await createMyPayment(courseInfo.course, parseFloat(courseInfo.price), event);

            // Start Wix payment process
            const result = await wixPayFrontend.startPayment(paymentSession.id, { showThankYouPage: false });
            let paymentStatus = "Pending";

            if (result.status === "Successful") {
                paymentStatus = "Paid";
                const jsonToEmail = {
                    firstName: event.first_name,
                    formName: courseInfo.emailFormName,
                    termInfo: courseInfo.emailTermInfo,
                    year: courseInfo.emailYear,
                    dateOfTheFirstClass: courseInfo.emailDateOfFirstClass,
                    hour: courseInfo.emailHour,
                    instructor: courseInfo.emailInstructor,
                    contactEmail: courseInfo.emailContactEmail
                }

                await sendEmailNotifications(event.email_d952, jsonToEmail);
            } else {
                paymentStatus = result.status;
                $w('#PayNoT').text = 'Payment Error: There was a problem processing your payment.\nPlease check your details and try again.';
                setTimeout(() => {
                    console.log(result.status)
                }, 2000);
                // $w('#PayNoT').expand();
            }

            // Update submission with payment status
            trainingSubmission.paymentStatus = paymentStatus;

            const sheetValues = [
                new Date().toDateString(),
                event.first_name,
                event.last_name,
                event.email_d952,
                phone,
                event.dogs_name,
                event.dogs_bread,
                event.prefered_day,
                "Checked",
                "Checked",
                paymentStatus,
            ]

            await Promise.all([
                appendValuesWrapper(sheetValues, googleSheet),
                updateCollection(collectionId, trainingSubmission)
            ]);

            wixLocationFrontend.to('/thank-you');
        } else {
            $w("#form1").submit();
        }

    })
}

function getLvL2Info(day) {
    Promise.all([
        generalQuery("Course", "_id", "947f56a4-a236-47b1-a9df-c7f71e170886"),
        generalQuery("Course", "_id", "71322720-ea65-4ed6-9163-f1643e4d1f4b")
    ]).then(([mondayResults, tuesdayResults]) => {
        itemLvl2Monday = mondayResults[0];
        itemLvl2Tuesday = tuesdayResults[0];

        $w('#title').html = itemLvl2Monday.formEnabledMessage;
        $w('#title').expand();

        if (itemLvl2Monday.enableForm && itemLvl2Tuesday.enableForm) {
            if (day) {
                // Use the same price for both
                let label = "";
                if (day == "Monday") label = `Level 2 Training Monday`, lvl2Price = itemLvl2Monday.price;
                else label = `Level 2 Training Tuesday`, lvl2Price = itemLvl2Tuesday.price;

                $w('#pricingDetails').text = label;
                $w('#totalPrice').text = `${lvl2Price}`;
            } else {
                $w('#boxLvl2').changeState('lvl2Form');
            }

            // Check availability and update UI accordingly
            checkAvailability(itemLvl2Monday.remainingSpots, itemLvl2Tuesday.remainingSpots);
        } else {
            // $w('#section2').collapse();
            $w('#section3').collapse();

            if (itemLvl2Monday.fullyBookedMessageActive && itemLvl2Monday.fullyBookedMessage) $w('#SubmitNoT').text = itemLvl2Monday.fullyBookedMessage;
            else $w('#SubmitNoT').text = itemLvl2Monday.formDisabledMessage;

            $w('#boxLvl2').changeState('lvl2Full');
        }

    }).catch(error => {
        console.error("Error fetching course data:", error);
    });
}

// Function to handle availability logic
function checkAvailability(mondayPeople, tuesdayPeople) {
    if (mondayPeople <= 0 && tuesdayPeople > 0) {
        updateFullMessage("Monday", "Tuesday");
        $w('#title').html = itemLvl2Tuesday.formEnabledMessage;
    } else if (tuesdayPeople <= 0 && mondayPeople > 0) {
        updateFullMessage("Tuesday", "Monday");
        $w('#title').html = itemLvl2Monday.formEnabledMessage;
    } else if (mondayPeople <= 0 && tuesdayPeople <= 0) {
        $w('#boxLvl2').changeState("lvl2Full");
    }
}

// Function to update full message and set preferred day
function updateFullMessage(fullDay, alternativeDay) {
    $w('#messageFull').text = `The ${fullDay} is already full.`;
    $w('#messageFull').expand();
    $w('#form1').setFieldValues({ prefered_day: alternativeDay });
}