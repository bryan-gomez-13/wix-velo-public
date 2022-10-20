import wixWindow from 'wix-window';
import wixSite from 'wix-site';

$w.onReady(function () {
    //console.log(wixSite.currentPage.name)
    if (wixSite.currentPage.name !== 'Latino Shop') {
        $w('#latinoFood').collapse();
        $w('#latinoShop').expand();
    } else {
        $w('#latinoShop').collapse();
        $w('#latinoFood').expand();
    }

    let formFactor = wixWindow.formFactor; // "Mobile"
    if (formFactor == "Desktop") {
        $w('#quickActionBar1').collapse()
    } else {
        $w('#quickActionBar1').collapse()
    }
});