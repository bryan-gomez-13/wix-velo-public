import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { eMail } from 'backend/email'

$w.onReady(async function () {
    $w('#dynamicDataset').onReady(async () => {
        await $w("#dataset1").setFilter(
            await wixData.filter().eq("jobId", $w("#dynamicDataset").getCurrentItem()._id)
            .and(wixData.filter().eq("active", true))
        ).then(() => {
            if ($w("#dataset1").getTotalCount() > 0) {
                $w('#repeater1').expand();
				$w('#columnStrip2').expand();
            } else {
                $w('#repeater1').collapse();
				$w('#columnStrip2').collapse();
            }
        });

        $w("#save").onClick(async () => {
            if ($w('#review').valid) {

                $w('#text6').hide();
                $w('#text5').show();

                let options = {
                    "suppressAuth": true,
                    "suppressHooks": true
                };

                let toSave = {
                    "jobId": $w("#dynamicDataset").getCurrentItem()._id,
                    "title": $w("#dynamicDataset").getCurrentItem().title,
                    "review": $w("#review").value,
                    "active": false
                }

                await wixData.insert("Reviews", toSave, options)
                    .then(async (results) => {
                        await eMail(toSave)
                        wixLocation.to("/")
                    })
                    .catch((err) => {
                        let errorMsg = err;
                        $w('#text5').hide();
                        $w('#text6').show();
                        console.log(err)
                    });
            } else {
                $w('#text6').show();
                $w('#text5').hide();
            }
        })

    })
});