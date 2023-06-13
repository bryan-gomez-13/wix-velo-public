import wixLocation from 'wix-location';
import {session} from 'wix-storage';

$w.onReady(function () {
    init();
});

function init() {
    // Buttons
    $w('#bt0').onClick(() => { $w('#multi').changeState('WhoAreThorneGroup'), buttons(0) })
    $w('#bt1').onClick(() => { $w('#multi').changeState('SelectingABuilder'), buttons(1) })
    $w('#bt2').onClick(() => { $w('#multi').changeState('YourLifeStage'), buttons(2) })
    $w('#bt3').onClick(() => { $w('#multi').changeState('RequestMagazine'), buttons(3) })
    $w('#bt4').onClick(() => { $w('#multi').changeState('TheProcess'), buttons(4) })
    $w('#bt5').onClick(() => { $w('#multi').changeState('DesignProcess'), buttons(5) })
    $w('#bt6').onClick(() => { $w('#multi').changeState('WorkingWithTGA'), buttons(6) })
    $w('#bt7').onClick(() => { $w('#multi').changeState('BuildProcess'), buttons(7) })

    //repeater
    $w('#rep').onItemReady(($item, itemData, index) => {
        $item('#repImage').onClick(() => {
			session.setItem("filterGallery", itemData.filter);
			wixLocation.to('/portfolio')
        })
    })
}

function buttons(id) {
    switch (id) {
    case 0:
        $w('#bt0').disable()
        $w('#bt1').enable(), $w('#bt2').enable(), $w('#bt3').enable(), $w('#bt4').enable(), $w('#bt5').enable(), $w('#bt6').enable(), $w('#bt7').enable()
        break;

    case 1:
        $w('#bt1').disable()
        $w('#bt0').enable(), $w('#bt2').enable(), $w('#bt3').enable(), $w('#bt4').enable(), $w('#bt5').enable(), $w('#bt6').enable(), $w('#bt7').enable()
        break;

    case 2:
        $w('#bt2').disable()
        $w('#bt1').enable(), $w('#bt0').enable(), $w('#bt3').enable(), $w('#bt4').enable(), $w('#bt5').enable(), $w('#bt6').enable(), $w('#bt7').enable()
        break;

    case 3:
        $w('#bt3').disable()
        $w('#bt1').enable(), $w('#bt2').enable(), $w('#bt0').enable(), $w('#bt4').enable(), $w('#bt5').enable(), $w('#bt6').enable(), $w('#bt7').enable()
        break;

    case 4:
        $w('#bt4').disable()
        $w('#bt1').enable(), $w('#bt2').enable(), $w('#bt3').enable(), $w('#bt0').enable(), $w('#bt5').enable(), $w('#bt6').enable(), $w('#bt7').enable()
        break;

    case 5:
        $w('#bt5').disable()
        $w('#bt1').enable(), $w('#bt2').enable(), $w('#bt3').enable(), $w('#bt4').enable(), $w('#bt0').enable(), $w('#bt6').enable(), $w('#bt7').enable()
        break;

    case 6:
        $w('#bt6').disable()
        $w('#bt1').enable(), $w('#bt2').enable(), $w('#bt3').enable(), $w('#bt4').enable(), $w('#bt5').enable(), $w('#bt0').enable(), $w('#bt7').enable()
        break;

    case 7:
        $w('#bt7').disable()
        $w('#bt1').enable(), $w('#bt2').enable(), $w('#bt3').enable(), $w('#bt4').enable(), $w('#bt5').enable(), $w('#bt6').enable(), $w('#bt0').enable()
        break;

    default:
        $w('#bt0').disable(), $w('#bt1').disable(), $w('#bt2').disable(), $w('#bt3').disable(), $w('#bt4').disable(), $w('#bt5').disable(), $w('#bt6').disable(), $w('#bt7').disable()
        break;
    }
}