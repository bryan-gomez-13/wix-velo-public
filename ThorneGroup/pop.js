import { getContact } from 'backend/ThorneGroup.jsw';
import { session } from 'wix-storage';

$w.onReady(function () {
    //Save information in campaign field in the form, if there is a campaing in the session
    if (session.getItem("campaign")) {
        $w('#source2').value = session.getItem("source");
        $w('#medium').value = session.getItem("medium");
        $w('#campaign').value = session.getItem("campaign");
    }
    init();
});

function init() {
    $w('#match').onChange(() => {
        if ($w('#match').checked) $w('#location').expand(), $w('#beds').expand(), $w('#budget').expand();
        else $w('#location').collapse(), $w('#beds').collapse(), $w('#budget').collapse();
    })

    $w('#send').onClick(() => {
        let email = $w('#email').value
        $w('#send').disable()
        getContact(email);
        //Delete item of the session
        session.removeItem("source");
        session.removeItem("medium");
        session.removeItem("campaign");
    })

    $w('#other').onChange(() => {
        if ($w('#other').checked) $w('#message').expand();
        else $w('#message').collapse();
    })

    $w('#match').onChange(() => checkBoxes())
    $w('#design').onChange(() => checkBoxes())
    $w('#inspo').onChange(() => checkBoxes())
    $w('#other').onChange(() => checkBoxes())
    $w('#send').onMouseIn(() => checkBoxes())

}

function checkBoxes() {
    if (($w('#design').checked || $w('#inspo').checked || $w('#match').checked || $w('#other').checked)) $w('#send').enable(), $w('#alertMessage').collapse();
    else $w('#send').disable(), $w('#alertMessage').text = "Please select at least one option", $w('#alertMessage').expand();
}