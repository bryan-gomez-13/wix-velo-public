import wixWindowFrontend from 'wix-window-frontend';

$w.onReady(function () {

    const context = wixWindowFrontend.lightbox.getContext();
    const video = context.artistInfo.artistVideo || context.artistInfo.artistVideoLink;

    $w('#artistVideo').src = video;
    // $w('#audioVideo').src = context.song;

    $w('#artistVideo').play();
    $w('#artistVideo').onEnded(() => {
        wixWindowFrontend.lightbox.close();
        // $w('#artistVideo').collapse();
        // $w('#audioVideo').expand();
        // $w('#audioVideo').play();
    })
});