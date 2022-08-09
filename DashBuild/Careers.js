import wixWindow from 'wix-window';
import wixLocation from 'wix-location';
import {session} from 'wix-storage';

var fadeOptions = {
    "duration": 500
};

$w.onReady(function () {
    //Menu
    $w('#open').onClick(() => open())
    $w('#close').onClick(() => close())
    //Repeater
    $w('#repeater2').onItemReady(($item, itemData) => {
        $item('#enquiry').onClick(() => {
            console.log(itemData)
            $w('#textBox1').value = 'I am applying for '+itemData.title;
            $w('#wixForms1').scrollTo();
        })
    })
    //console.log(session.getItem("oldPage"))
    //$w('#goBack').link = session.getItem("oldPage")
    $w('#goBack').onClick(() => wixLocation.to(session.getItem("oldPage")))
});

function open() {
    $w('#stack').show("fade", fadeOptions);
    $w('#box91').show("fade", fadeOptions);
    $w('#close').show("fade", fadeOptions);
    $w('#logo').show("fade", fadeOptions);
    $w('#open').hide("fade", fadeOptions);
}

function close() {
    $w('#stack').hide("fade", fadeOptions);
    $w('#box91').hide("fade", fadeOptions);
    $w('#close').hide("fade", fadeOptions);
    $w('#logo').hide("fade", fadeOptions);
    $w('#open').show("fade", fadeOptions);
}