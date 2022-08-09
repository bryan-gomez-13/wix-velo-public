import wixSite from 'wix-site';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';

$w.onReady(function () {
    $w('#bContact').onClick(() => {
        session.setItem("web", wixSite.currentPage.name)
        wixLocation.to('/contact')
    })
});