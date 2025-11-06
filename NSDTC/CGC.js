import { appendValuesWrapper } from 'backend/functions.web.js';
import { generalQuery_v2, updateCollection, generalQuery, saveData, lessOneWixForms } from 'backend/collections.web.js';
import wixLocationFrontend from 'wix-location-frontend';

let dogsNameCheck = true,
    values;

// Rally-O
let courseId = "62107d40-3ed4-4158-a3c2-8494e74749dd";
let collectionId = 'WixForms/b961d2f5-a07d-409a-9ff4-f93d6feda358';
let googleSheet = 'sheetCGC';

$w.onReady(function () {
    getFormInfo();
    init();
});

function init() {
    $w("#form1").onFieldValueChange((newValues) => {
        if (newValues["email"] && dogsNameCheck) {
            generalQuery_v2("Training", "email", newValues["email"]).then((result) => {
                if (result.length > 0) {
                    dogsNameCheck = false;
                    $w('#form1').setFieldValues({
                        dogs_name: result[0].dogsName,
                        bred: result[0].dogsBreed,
                    })
                }
            })
        }
    });

    $w("#form1").onSubmit((event) => {
        const date = new Date();
        const phone = `${event.phone_number}`;

        // Prepare the values to append to the sheet
        values = [
            date.toDateString(),
            event.name,
            event.handler,
            event.email,
            phone,
            event.dogs_name,
            event.bred,
            "Checked",
        ];
    })

    $w('#btSubmit').onClick(async () => {
        // Get course info
        const courseInfo = (await generalQuery('Course', '_id', courseId))[0];

        // If no spots available, disable button and show message
        if (courseInfo.remainingSpots <= 0) {
            $w('#secTitle').collapse();

            if (courseInfo.fullyBookedMessageActive && courseInfo.fullyBookedMessage) $w('#SubmitNoT').text = courseInfo.fullyBookedMessage;
            else $w('#SubmitNoT').text = courseInfo.formDisabledMessage;

            $w('#boxLvl2').changeState('message');
        } else {
            $w('#btSubmit').hide();
            $w("#form1").submit()
                .then(() => {
                    $w('#btSubmit').hide();
                }).catch(() => {
                    $w('#btSubmit').show();
                })
        }
    })

    $w("#form1").onSubmitSuccess(async (event) => {
        try {
            // Get course info
            const courseInfo = (await generalQuery('Course', '_id', courseId))[0];

            // If no spots available, disable button and show message
            if (courseInfo.remainingSpots <= 0) {
                $w('#secTitle').collapse();

                if (courseInfo.fullyBookedMessageActive && courseInfo.fullyBookedMessage) $w('#SubmitNoT').text = courseInfo.fullyBookedMessage;
                else $w('#SubmitNoT').text = courseInfo.formDisabledMessage;

                $w('#boxLvl2').changeState('message');
            }

            // Execute both updates in parallel
            await Promise.all([
                lessOneWixForms(courseId, collectionId, 'payment'),
                appendValuesWrapper(values, googleSheet),
            ]);
            wixLocationFrontend.to('/thank-you');

            // // Get course info
            // const formInfo = await generalQuery_v2("Course", "_id", courseId);
            // const itemData = formInfo?.[0];

            // // Ensure course data is valid
            // if (!itemData) {
            //     console.error("Course not found.");
            //     return;
            // }

            // // Update number of people
            // itemData.numberOfPeople = Number(itemData.numberOfPeople) - 1;

            // // Execute both updates in parallel
            // await Promise.all([
            //     updateCollection("Course", itemData),
            //     appendValuesWrapper(values, "sheetCGC"),
            // ]);

            // // Redirect to thank you page
            // wixLocationFrontend.to('/thank-you');

        } catch (error) {
            console.error("Error processing form submission:", error);
        }
    });
}

async function getFormInfo() {
    const course = await generalQuery('Course', '_id', courseId);
    const itemData = course[0]
    $w('#title').html = itemData.formEnabledMessage;
    $w('#SubmitNoT').text = itemData.formDisabledMessage;
    $w('#secTitle').expand();

    if (itemData.enableForm == false || parseInt(itemData.remainingSpots) <= 0) {
        // $w('#section2').collapse();
        $w('#secTitle').collapse();

        if (itemData.fullyBookedMessageActive && itemData.fullyBookedMessage) $w('#SubmitNoT').text = itemData.fullyBookedMessage;
        else $w('#SubmitNoT').text = itemData.formDisabledMessage;

        $w('#boxLvl2').changeState('message');
    } else {
        $w('#boxLvl2').changeState('form');
    }
}