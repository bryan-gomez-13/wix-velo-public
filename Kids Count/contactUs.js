import { session } from 'wix-storage';
import { email } from 'backend/email.jsw'
import wixLocation from 'wix-location';
import wixData from 'wix-data';

$w.onReady(function () {
    if (session.getItem("centres")) {
        $w('#centres').value = [session.getItem("centres")];
        session.clear();
    }

    getDrop();

    $w('#inquiry2').onChange(() => {
        if ($w('#inquiry2').value == "General inquiry") {
            $w('#iWouldLike').required = true;
            $w('#messageBox').required = false;
            $w('#iWouldLike').resetValidityIndication();
            $w('#messageBox').resetValidityIndication();

            $w('#iWouldLike').expand();
            $w('#messageBox').expand();

            $w('#numberChildrenLEMC').required = false
            $w('#relationshipChildrenLEMC').required = false
            $w('#ageGroupLEMC').required = false
            $w('#sessionTimeLEMC').required = false
            $w('#daysLEMC').required = false
            $w('#dateLEMC').required = false
            $w('#jobJV').required = false
            $w('#cv').required = false

            $w('#numberChildrenLEMC').collapse();
            $w('#relationshipChildrenLEMC').collapse();
            $w('#ageGroupLEMC').collapse();
            $w('#sessionTimeLEMC').collapse();
            $w('#daysLEMC').collapse();
            $w('#dateLEMC').collapse();
            $w('#jobJV').collapse();
            $w('#cv').collapse();
        } else if ($w('#inquiry2').value == "Looking to enrol my child(ren)") {
            $w('#numberChildrenLEMC').required = true
            $w('#relationshipChildrenLEMC').required = true
            $w('#ageGroupLEMC').required = true
            $w('#sessionTimeLEMC').required = true
            $w('#daysLEMC').required = true
            $w('#dateLEMC').required = true

            $w('#numberChildrenLEMC').resetValidityIndication();
            $w('#relationshipChildrenLEMC').resetValidityIndication();
            $w('#ageGroupLEMC').resetValidityIndication();
            $w('#sessionTimeLEMC').resetValidityIndication();
            $w('#daysLEMC').resetValidityIndication();
            $w('#dateLEMC').resetValidityIndication();

            $w('#numberChildrenLEMC').expand();
            $w('#relationshipChildrenLEMC').expand();
            $w('#ageGroupLEMC').expand();
            $w('#sessionTimeLEMC').expand();
            $w('#daysLEMC').expand();
            $w('#dateLEMC').expand();

            $w('#iWouldLike').required = false;
            $w('#jobJV').required = false;
            $w('#cv').required = false;

            $w('#iWouldLike').collapse();
            $w('#jobJV').collapse();
            $w('#cv').collapse();
            $w('#messageBox').collapse();
        } else if ($w('#inquiry2').value == "Job Vacancies") {
            $w('#iWouldLike').required = true;
            $w('#jobJV').required = true;
            $w('#cv').required = true;
            $w('#messageBox').required = false;

            $w('#iWouldLike').resetValidityIndication();
            $w('#jobJV').resetValidityIndication();
            $w('#cv').resetValidityIndication();

            $w('#iWouldLike').expand();
            $w('#jobJV').expand();
            $w('#cv').expand();
            $w('#messageBox').expand();

            $w('#numberChildrenLEMC').required = false
            $w('#relationshipChildrenLEMC').required = false
            $w('#ageGroupLEMC').required = false
            $w('#sessionTimeLEMC').required = false
            $w('#daysLEMC').required = false
            $w('#dateLEMC').required = false

            $w('#numberChildrenLEMC').collapse();
            $w('#relationshipChildrenLEMC').collapse();
            $w('#ageGroupLEMC').collapse();
            $w('#sessionTimeLEMC').collapse();
            $w('#daysLEMC').collapse();
            $w('#dateLEMC').collapse();

        }
    })

    $w('#dataCentres').onAfterSave(async (data) => {
        //console.log(data)
        let json;
        if (data.inquiry == "General inquiry") {
            json = {
                Name: data.name,
                subject: data.centres.join(', '),
                iWouldLike: data.iWouldLikeGeneralEnquiry,
                Email: data.email,
                Phone: data.phone,
                message: data.message,
                Contacted: data.howWouldYouPreferredToBeContacted.join(', ')
            };
            //console.log(json);
            await email(json, data.centres, "generalEnquiry");
            wixLocation.to('/thank-you');
        } else if (data.inquiry == "Looking to enrol my child(ren)") {
            json = {
                Name: data.name,
                subject: data.centres.join(', '),
                iWouldLike: data.iWouldLikeGeneralEnquiry,
                sessionTime: data.whatSessionTimesAreYouLookingFor.join(', '),
                Email: data.email,
                dayOfTheWeek: data.whatDaysAreYouLookingFor.join(', '),
                age: data.ageGroupSOfTheChildRen.join(', '),
                numberOfChild: data.numberOfChildrenWantingToEnrol,
                Phone: data.phone,
                relationship: data.relationshipToTheChildRen,
                dateToStart: data.whenWouldYouLikeToStart,
                Contacted: data.howWouldYouPreferredToBeContacted.join(', ')
            };
            //console.log(json);
            await email(json, data.centres, "lookingToEnrol");
            wixLocation.to('/thank-you');
        } else if (data.inquiry == "Job Vacancies") {
            json = {
                Name: data.name,
                subject: data.centres.join(', '),
                iWouldLike: data.iWouldLikeGeneralEnquiry,
                Email: data.email,
                Phone: data.phone,
                urlDoc: "",
                message: data.message,
                jobTitle: data.jobTitle,
                Contacted: data.howWouldYouPreferredToBeContacted.join(', ')
            };

            let url = "";
            if (data.cv) url = data.cv;
            else url = await wixData.query('ContactCentres').eq('_id', data._id).find().then((item) => { return item.items[0].cv }).catch((err) => console.log(err))
            let regex = /\/v1\/(.*?)\.pdf\//;
            let match = url.match(regex);
            if (match && match.length > 1) json.urlDoc = "https://73f5ce08-1aae-4339-bfc9-d9ded44f484a.usrfiles.com/ugd/" + match[1] + ".pdf";
            else json.urlDoc = "https://www.kidscount.co.nz/"
            //console.log(json)
            await email(json, data.centres, "jobVacancies");
            wixLocation.to('/thank-you');
        }
    })
});

function getDrop() {
    wixData.query('Jobtitle').ascending('title').isNotEmpty('title').find().then((results) => {
        let items = results.items;
        let array = []
        for (let i = 0; i < items.length; i++) {
            array.push({ label: items[i].title, value: items[i].title })
        }
        $w('#jobJV').options = array;
    })
}