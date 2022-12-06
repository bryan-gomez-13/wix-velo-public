import { session } from 'wix-storage';
import wixWindow from 'wix-window';

$w.onReady(function () {
    $w("#dynamicDataset").onReady(() => {
        let item = $w("#dynamicDataset").getCurrentItem();

        if (item.description) $w('#description').expand()
        else $w('#description').collapse()

        if (item.pdf) $w('#pdf1').expand()
        else $w('#pdf1').collapse()

        if (item.pdf2) $w('#pdf2').expand()
        else $w('#pdf2').collapse()

        if (item.pdf3) $w('#pdf3').expand()
        else $w('#pdf3').collapse()

        if (item.pdf4) $w('#pdf4').expand()
        else $w('#pdf4').collapse()

        if (item.pdf5) $w('#pdf5').expand()
        else $w('#pdf5').collapse()

        $w('#enquiry').onClick(() => {
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
});