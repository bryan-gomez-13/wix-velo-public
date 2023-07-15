import wixLocation from 'wix-location';
import { session } from 'wix-storage';
import wixLocationFrontend from 'wix-location-frontend';

$w.onReady(async function () {
    init();
    if (wixLocationFrontend.query) {
        if (wixLocationFrontend.query.tabs) {
            switch (wixLocationFrontend.query.tabs) {
            case "design-process":
                $w('#multi').changeState('DesignProcess')
                await buttons(1);
                $w('#box').show();
                break;

            case "construction-process":
                $w('#multi').changeState('ContructionProcess')
                await buttons(2);
                $w('#box').show();
                break;

            default:
                $w('#multi').changeState('WhyThorneGroup')
                await buttons(0);
                $w('#box').show();
                break;
            }
        } else $w('#box').show();
    }
});

function init() {
    // Buttons
    $w('#bt0').onClick(() => { $w('#multi').changeState('WhyThorneGroup'), buttons(0) })
    $w('#bt1').onClick(() => { $w('#multi').changeState('DesignProcess'), buttons(1) })
    $w('#bt2').onClick(() => { $w('#multi').changeState('ContructionProcess'), buttons(2) })
    //$w('#bt3').onClick(() => { $w('#multi').changeState('RequestMagazine'), buttons(3) })
    //$w('#bt4').onClick(() => { $w('#multi').changeState('TheProcess'), buttons(4) })
    //$w('#bt5').onClick(() => { $w('#multi').changeState('DesignProcess'), buttons(5) })
    //$w('#bt6').onClick(() => { $w('#multi').changeState('WorkingWithTGA'), buttons(6) })
    //$w('#bt7').onClick(() => { $w('#multi').changeState('BuildProcess'), buttons(7) })

    //repeater
    /*
    $w('#rep').onItemReady(($item, itemData, index) => {
        $item('#repImage').onClick(() => {
            session.setItem("filterGallery", itemData.filter);
            wixLocation.to('/portfolio')
        })
    })
    */
}

function buttons(id) {
    switch (id) {
    case 0:
        $w('#bt0').disable();
        $w('#bt1').enable(), $w('#bt2').enable();
        break;

    case 1:
        $w('#bt1').disable();
        $w('#bt0').enable(), $w('#bt2').enable();
        break;

    case 2:
        $w('#bt2').disable();
        $w('#bt1').enable(), $w('#bt0').enable();
        break;

    default:
        $w('#bt0').disable(), $w('#bt1').disable(), $w('#bt2').disable();
        break;
    }
}