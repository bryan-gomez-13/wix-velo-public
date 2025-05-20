import { appendValuesWrapper } from 'backend/functions.web.js';
import { generalQuery_v2, updateCollection } from 'backend/collections.web.js';
import wixLocationFrontend from 'wix-location-frontend';

let dogsNameCheck = true,values;

$w.onReady(function () {
    getLvL4Info();
    init();
});

function init() {
    $w("#form1").onFieldValueChange((newValues) => {
        if (newValues["email_d952"] && dogsNameCheck) {
            generalQuery_v2("Training", "email", newValues["email_d952"]).then((result) => {
                if (result.length > 0) {
                    dogsNameCheck = false;
                    $w('#form1').setFieldValues({
                        dogs_name: result[0].dogsName,
                        dogs_breed: result[0].dogsBreed,
                    })
                }
            })
        }
    });

    $w("#form1").onSubmit((event) => {
        const date = new Date();
        const phone = `${event.phone}`;

        // Prepare the values to append to the sheet
        values = [
            date.toDateString(),
            event.first_name,
            event.last_name,
            event.email_d952,
            phone,
            event.dogs_name,
            event.dogs_breed,
            "Checked",
        ];
    })

    $w('#form1').onSubmitSuccess(async () => {
        try {
            // Get course info
            const lvl4TrainingInfo = await generalQuery_v2("Course", "_id", "c355acf9-bbf3-4103-954f-8d21ed140997");
            const itemData = lvl4TrainingInfo?.[0];

            // Ensure course data is valid
            if (!itemData) {
                console.error("Course not found.");
                return;
            }

            // Update number of people
            itemData.numberOfPeople = Number(itemData.numberOfPeople) - 1;

            // Execute both updates in parallel
            await Promise.all([
                updateCollection("Course", itemData),
                appendValuesWrapper(values, "sheetLvL4"),
            ]);

            // Redirect to thank you page
            wixLocationFrontend.to('/thank-you');

        } catch (error) {
            console.error("Error processing form submission:", error);
        }
    })

}

async function getLvL4Info() {
    const lvl4TrainingInfo = await generalQuery_v2("Course", "_id", "c355acf9-bbf3-4103-954f-8d21ed140997");
    const itemData = lvl4TrainingInfo[0]
    $w('#title').html = itemData.formEnabledMessage;
    $w('#SubmitNoT').text = itemData.formDisabledMessage;
    $w('#secTitle').expand();

    if (itemData.numberOfPeople <= 0 || itemData.enableForm == false) $w('#boxLvl4').changeState('lvl4Full')
}