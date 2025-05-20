import { createMyPayment, appendValuesWrapper } from 'backend/functions.web.js';
import { generalQuery, saveData, updateCollection } from 'backend/collections.web.js';
import wixLocationFrontend from 'wix-location-frontend';
import wixPayFrontend from "wix-pay-frontend";

let dogsNameCheck = true;
let lvl2Price, itemLvl2Monday, itemLvl2Tuesday;

$w.onReady(function () {
    getLvL2Info();
    init();
});

function init() {
    $w("#form1").onFieldValueChange((newValues) => {
        if (newValues["email_d952"] && dogsNameCheck) {
            generalQuery("Training", "email", newValues["email_d952"]).then((result) => {
                if (result.items.length > 0) {
                    dogsNameCheck = false;
                    $w('#form1').setFieldValues({
                        dogs_name: result.items[0].dogsName,
                        dogs_bread: result.items[0].dogsBreed,
                        dog_lvl_1: true
                    })
                }
            })
        }

        if (newValues["prefered_day"]) {
            const isMonday = newValues["prefered_day"] === "Monday";
            const isFull = isMonday ? itemLvl2Monday.numberOfPeople === 0 : itemLvl2Tuesday.numberOfPeople === 0;
            const alternativeDay = isMonday ? "Tuesday" : "Monday";

            if (isFull) {
                $w('#messageFull').text = `The ${newValues["prefered_day"]} you selected is already full. Please choose another one.`;
                $w('#messageFull').expand();
                $w('#form1').setFieldValues({ prefered_day: alternativeDay });
            }
        }
    });

    $w("#form1").onSubmit((event) => {
        if (event.dog_lvl_1) {
            getLvL2Info(event.prefered_day);
            $w('#boxLvl2').changeState("lvl2Pay")

            // console.log(event)
            setTimeout(() => {
                createMyPayment("Level 2 Training", lvl2Price, event).then((payment) => {
                    wixPayFrontend.startPayment(payment.id).then(async (result) => {
                        const status = result.status;
                        const date = new Date();
                        const phone = `${event.phone}`

                        const values = [
                            date.toDateString(),
                            event.first_name,
                            event.last_name,
                            event.email_d952,
                            phone,
                            event.dogs_name,
                            event.dogs_bread,
                            event.prefered_day,
                            "Checked",
                            status,
                        ]

                        const jsonToSaveLvL2 = {
                            firstName: event.first_name,
                            lastName: event.last_name,
                            email: event.email_d952,
                            phone: phone,
                            dogsName: event.dogs_name,
                            dogsBread: event.dogs_bread,
                            preferedDay: event.prefered_day,
                            checkLvl1: "Checked",
                            paymentStatus: status,
                        }

                        if (status == "Successful") {
                            let item;
                            if (event.prefered_day == "Monday") {
                                itemLvl2Monday.numberOfPeople--;
                                item = itemLvl2Monday;
                            } else {
                                itemLvl2Tuesday.numberOfPeople--;
                                item = itemLvl2Tuesday;
                            }

                            updateCollection("Course", item)
                        }

                        Promise.all([
                            saveData("Level2Training", jsonToSaveLvL2),
                            appendValuesWrapper(values, "sheetLvL2"),
                        ]).then(() => {
                            wixLocationFrontend.to('/thank-you');
                        }).catch((error) => {
                            console.error("Error processing payment data:", error);
                        });
                    });
                });
            }, 2000);
        }
    })
}

function getLvL2Info(day) {
    Promise.all([
        generalQuery("Course", "_id", "947f56a4-a236-47b1-a9df-c7f71e170886"),
        generalQuery("Course", "_id", "71322720-ea65-4ed6-9163-f1643e4d1f4b")
    ]).then(([mondayResults, tuesdayResults]) => {
        itemLvl2Monday = mondayResults.items[0];
        itemLvl2Tuesday = tuesdayResults.items[0];

        $w('#title').html = itemLvl2Monday.formEnabledMessage;
        $w('#SubmitNoT').text = itemLvl2Monday.formDisabledMessage;
        $w('#title').expand();

        if (itemLvl2Monday.enableForm && itemLvl2Tuesday.enableForm) {
            $w('#boxLvl2').changeState('lvl2Form');
            if (day) {
                // Use the same price for both
                let label = "";
                if (day == "Monday") label = `Level 2 Training Monday`, lvl2Price = itemLvl2Monday.price;
                else label = `Level 2 Training Tuesday`, lvl2Price = itemLvl2Tuesday.price;

                $w('#pricingDetails').text = label;
                $w('#totalPrice').text = `${lvl2Price}`;
            }

            // Check availability and update UI accordingly
            checkAvailability(itemLvl2Monday.numberOfPeople, itemLvl2Tuesday.numberOfPeople);
        } else {
            $w('#boxLvl2').changeState('lvl2Full')
        }

    }).catch(error => {
        console.error("Error fetching course data:", error);
    });
}

// Function to handle availability logic
function checkAvailability(mondayPeople, tuesdayPeople) {
    if (mondayPeople <= 0 && tuesdayPeople > 0) {
        updateFullMessage("Monday", "Tuesday");
    } else if (tuesdayPeople <= 0 && mondayPeople > 0) {
        updateFullMessage("Tuesday", "Monday");
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