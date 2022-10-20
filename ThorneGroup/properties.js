$w.onReady(function () {
    $w("#dynamicDataset").onReady(() => {
        $w("#dynamicDataset").getItems(0, 1)
            .then((result) => {
                //console.log(result.items[0])
                let button = result.items[0].pdf;
                let gallery = result.items[0].featuresWeLove;
                if (button) {
                    $w('#buttonDow').show();
                }
                if (!gallery) {
                    $w('#text241').collapse();
                    $w('#gallery2').collapse();
                }
                /* Ryan Edit 10.6.2022 to show the sands lightbox for analytics tracking*/
                if (result.items[0]._id == "66e35f62-cbae-45bf-8457-6c26fc72e808") {
                    $w('#requestbrochure1').show();
                    $w('#requestbrochure1').expand();
                    $w('#requestbrochure2').show();
                    $w('#requestbrochure2').expand();
                }

                if (!(result.items[0].pdf)) $w('#buttonDow').hide()
                /* Ryan Edit 10.6.2022 to show lightbox for analytics tracking
                if(result.items[0]._id == "66e35f62-cbae-45bf-8457-6c26fc72e808") $w('#contactUs').link = "https://forms.wix.com/f94108eb-e9d1-4f1d-a76e-367f33e24a56:318c8f4b-eb79-4758-ad0d-2c5ba1ccb00d"
                else $w('#contactUs').link = "/contact"
                */
            })
            .catch((err) => {
                console.log(err)
            });
    });

});