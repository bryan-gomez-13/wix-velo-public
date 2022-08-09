import wixLocation from 'wix-location';
$w.onReady(function () {
    $w("#dynamicDataset").onReady(() => {
        $w("#dynamicDataset").getItems(0, 1)
            .then((result) => {
                let button = result.items[0].pdf;
                let gallery = result.items[0].featuresWeLove;
                if (button) {
                    $w('#buttonDow').show();
                }
                if(!gallery){
                    $w('#text241').collapse();
                    $w('#gallery2').collapse();
                }
                /* Ryan Edit 10.6.2022 to show the sands lightbox for analytics tracking*/
                if(result.items[0]._id == "91f39ed1-9425-40df-83a4-bad7529ddcdd") {
                    $w('#requestbrochure1').show();
                    $w('#requestbrochure1').expand();
                    $w('#requestbrochure2').show();
                    $w('#requestbrochure2').expand();
                }
                /* Ryan Edit 10.6.2022 to show lightbox for analytics tracking
                if(result.items[0]._id == "91f39ed1-9425-40df-83a4-bad7529ddcdd") $w('#contactUs').link = "https://forms.wix.com/f94108eb-e9d1-4f1d-a76e-367f33e24a56:318c8f4b-eb79-4758-ad0d-2c5ba1ccb00d"
                else $w('#contactUs').link = "/contact"
                */
            })
            .catch((err) => {
                console.log(err)
            });
    });


});