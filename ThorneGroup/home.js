import wixAnimations from 'wix-animations';
import wixWindow from 'wix-window';

var open = false;
let screenSizeInterval;

$w.onReady(function () {
    $w('#navOpen').onClick(() => menu())
});

function menu() {
    if (open == false) {
        screenSize();
        screenSizeInterval = setInterval(screenSize, 500)
        open = true;
    } else {
        clearInterval(screenSizeInterval);
        wixAnimations.timeline().add($w('#nav'), { x: 0, duration: 300, easing: 'easeInOutCubic' }).play();
        open = false;
    }
}

function screenSize() {
    let formFactor = wixWindow.formFactor; // "Mobile"
    wixWindow.getBoundingRect()
        .then((windowSizeInfo) => {
            let windowWidth = windowSizeInfo.window.width;
            if (formFactor == "Desktop") wixAnimations.timeline().add($w('#nav'), { x: -(windowWidth * 0.95), duration: 300, easing: 'easeInOutCubic' }).play();
            else if (formFactor == "Mobile") wixAnimations.timeline().add($w('#nav'), { x: -(windowWidth * 0.85), duration: 300, easing: 'easeInOutCubic' }).play();
            else if (formFactor == "Tablet") wixAnimations.timeline().add($w('#nav'), { x: -(windowWidth * 0.90), duration: 300, easing: 'easeInOutCubic' }).play();
        });
}