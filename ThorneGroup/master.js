import { session } from 'wix-storage';
import wixSite from 'wix-site';
import wixWindow from 'wix-window';
import wixLocation from 'wix-location';

$w.onReady(function () {
    //Save query of the url
    //Test for the campaign with this link https://www.thornegroup.co.nz/contact?utm_source=facebook&utm_medium=medium&utm_campaign=campaign&gtm_debug=1657270176835
    if (!(session.getItem("campaign"))) {
        if (wixLocation.query) {
            session.setItem("source", wixLocation.query['utm_source']);
            session.setItem("medium", wixLocation.query['utm_medium']);
            session.setItem("campaign", wixLocation.query['utm_campaign']);
        }
    }

    if (wixSite.currentPage.url.includes('/properties') || wixSite.currentPage.url.includes('/portfolio')) {
        if (!(session.getItem("popUp"))) {
            session.setItem("popUp", "OK");
            setTimeout(() => wixWindow.openLightbox("Pop up"), 5000);
        }
    }
});