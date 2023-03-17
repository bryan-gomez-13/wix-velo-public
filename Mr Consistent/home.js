import wixAnimations from 'wix-animations';
import wixWindow from 'wix-window';

const runningTxt = wixAnimations.timeline({ repeat: -1 });
const runningTxt2 = wixAnimations.timeline({ repeat: -1 });
const runningTxt3 = wixAnimations.timeline({ repeat: -1 });

$w.onReady(function () {
    playInfiniteScroll()
});

function playInfiniteScroll() {
    wixWindow.getBoundingRect().then((windowSizeInfo) => {
        let sliderWidth = windowSizeInfo.window.width/3;

        runningTxt.add($w('#text111'), {
            x: -sliderWidth,
            duration: 8000,
            easing: 'easeLinear'
        }).play()

        runningTxt2.add($w('#text112'), {
            x: -sliderWidth,
            duration: 8000,
            easing: 'easeLinear'
        }).play()

        runningTxt3.add($w('#text113'), {
            x: -sliderWidth,
            duration: 8000,
            easing: 'easeLinear'
        }).play()

        $w('#box102').onViewportEnter(() => {
            runningTxt.play()
            runningTxt2.play()
            runningTxt3.play()
        }).onViewportLeave(() => {
            runningTxt.pause();
            runningTxt2.pause()
            runningTxt3.pause()
        })
    })
}