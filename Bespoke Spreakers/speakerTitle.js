import { session } from 'wix-storage';
import wixWindow from 'wix-window';

$w.onReady(function () {
    let item = $w('#dynamicDataset').getCurrentItem()
    console.log($w('#dynamicDataset').getCurrentItem())
    /*
    if (!(item.testimonials)) $w('#box2').collapse()
    else $w('#box2').expand();
    

	if (!(item.topics)) $w('#box1').collapse()
    else $w('#box1').expand();
    */

    $w('#enquireOne').onClick(() => {
        if ((session.getItem("enquire"))) {
            if (!(session.getItem("enquire").includes(item.title))) session.setItem("enquire", session.getItem("enquire") + ' - ' + item.title);
            else session.setItem("enquire", item.title);
            wixWindow.openLightbox("Enquiry");
        } else {
            session.setItem("enquire", item.title);
            wixWindow.openLightbox("Enquiry");
        }
    })

    $w('#enquireTwo').onClick(() => {
        if ((session.getItem("enquire"))) {
            if (!(session.getItem("enquire").includes(item.title))) session.setItem("enquire", session.getItem("enquire") + ' - ' + item.title);
            else session.setItem("enquire", item.title);
            wixWindow.openLightbox("Enquiry");
        } else {
            session.setItem("enquire", item.title);
            wixWindow.openLightbox("Enquiry");
        }
    })
});