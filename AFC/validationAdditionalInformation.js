import wixWindowFrontend from "wix-window-frontend";

$w.onReady(function () {

    $w('#btYes').onClick(() => wixWindowFrontend.lightbox.close({ option: 'Yes' }));
    $w('#btNo').onClick(() => wixWindowFrontend.lightbox.close({ option: 'No' }));

});