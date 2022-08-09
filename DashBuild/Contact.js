import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import {session} from 'wix-storage';

var fadeOptions = {
    "duration": 500
};

$w.onReady(function () {
    if (wixWindow.formFactor !== 'Desktop') disableButtons();
    //Menu
    $w('#open').onClick(() => openM())
    $w('#button7').onClick(() => closeM())

    //console.log(session.getItem("oldPage"))
    //$w('#goBack').link = session.getItem("oldPage")
    $w('#goBack').onClick(() => wixLocation.to(session.getItem("oldPage")))
});

function openM() {
    $w('#box92').show("fade", fadeOptions);
    $w('#box91').show("fade", fadeOptions);
    $w('#button7').show("fade", fadeOptions);
    $w('#logo').show("fade", fadeOptions);
    $w('#open').hide("fade", fadeOptions);
}

function closeM() {
    $w('#box92').hide("fade", fadeOptions);
    $w('#box91').hide("fade", fadeOptions);
    $w('#button7').hide("fade", fadeOptions);
    $w('#logo').hide("fade", fadeOptions);
    $w('#open').show("fade", fadeOptions);
}

function disableButtons() {
    $w('#bProject').enable()
    $w('#bAboutUs').enable()
    $w('#bCareers').enable()
    $w('#bContact').disable()
}