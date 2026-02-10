import { appendValuesWrapper } from 'backend/functions.web.js';
import { generalQuery, generalQuery_v2, updateCollection, lessOneWixForms } from 'backend/collections.web.js';
import wixLocationFrontend from 'wix-location-frontend';
import { sendEmailNotifications } from 'backend/emails.web.js';

let dogsNameCheck = true,
    values;

let courseId = "9134fb5f-a352-450f-b29b-41bd53ef36b0";
let collectionId = 'WixForms/ee92c6e1-7567-45f6-8c19-b64064e114eb';
let googleSheet = 'sheetLvL3';

$w.onReady(function () {
    getLvL3Info();
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
            event.name,
            event.handler,
            event.email_d952,
            phone,
            event.dogs_name,
            event.dogs_breed,
            "Checked",
        ];
    })

    $w('#btSubmit').onClick(async () => {
        $w('#btSubmit').disable();
        // Get course info
        const courseInfo = (await generalQuery('Course', '_id', courseId))[0];

        // If no spots available, disable button and show message
        if (courseInfo.remainingSpots <= 0) {
            $w('#secTitle').collapse();

            if (courseInfo.fullyBookedMessageActive && courseInfo.fullyBookedMessage) $w('#SubmitNoT').text = courseInfo.fullyBookedMessage;
            else $w('#SubmitNoT').text = courseInfo.formDisabledMessage;

            $w('#boxLvl2').changeState('lvl3Full');
        } else {
            $w('#btSubmit').hide();
            $w('#btSubmit').disable();
            $w("#form1").submit()
                .then(() => {
                    $w('#btSubmit').hide();
                }).catch(() => {
                    $w('#btSubmit').show();
                    $w('#btSubmit').enable();
                })
        }
    })

    $w("#form1").onSubmitSuccess(async () => {
        try {
            $w('#reloadThanks').expand();

            await delay(1500);

            // Get course info
            const courseInfo = (await generalQuery('Course', '_id', courseId))[0];

            // If no spots available, disable button and show message
            if (courseInfo.remainingSpots <= 0) {
                $w('#secTitle').collapse();

                if (courseInfo.fullyBookedMessageActive && courseInfo.fullyBookedMessage) $w('#SubmitNoT').text = courseInfo.fullyBookedMessage;
                else $w('#SubmitNoT').text = courseInfo.formDisabledMessage;

                $w('#boxLvl2').changeState('lvl3Full');
            } else {
                const jsonToEmail = {
                    firstName: values[1],
                    formName: courseInfo.emailFormName,
                    termInfo: courseInfo.emailTermInfo,
                    year: courseInfo.emailYear,
                    dateOfTheFirstClass: courseInfo.emailDateOfFirstClass,
                    hour: courseInfo.emailHour,
                    instructor: courseInfo.emailInstructor,
                    contactEmail: courseInfo.emailContactEmail
                }

                await sendEmailNotifications(values[3], jsonToEmail);
                // Execute both updates in parallel
                await Promise.all([
                    lessOneWixForms(courseId, collectionId, 'payment'),
                    appendValuesWrapper(values, googleSheet),
                ]);
                wixLocationFrontend.to('/thank-you');
            }

        } catch (error) {
            console.error("Error processing form submission:", error);
        }
    });

    $w("#form1").onSubmitFailure(() => {
        $w('#btSubmit').enable();
    })
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getLvL3Info() {
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

        $w('#boxLvl2').changeState('lvl3Full');
    } else {
        $w('#boxLvl2').changeState('lvl3Form');
    }
}