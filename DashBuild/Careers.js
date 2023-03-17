import wixWindow from 'wix-window';
import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { session } from 'wix-storage';

var fadeOptions = {
    "duration": 500
};

$w.onReady(function () {
    drop();
    //Menu
    $w('#open').onClick(() => open())
    $w('#close').onClick(() => close())
    //Repeater

    $w('#repeater2').onItemReady(($item, itemData) => {
        $item('#enquiry').onClick(() => {
            //console.log(itemData)
            $w('#position').value = itemData.title
            //$w('#textBox5').value = 'I am applying for ' + itemData.title;
            $w('#wixForms3').scrollTo();
        })
    })

    //console.log(session.getItem("oldPage"))
    //$w('#goBack').link = session.getItem("oldPage")
    $w('#goBack').onClick(() => wixLocation.to(session.getItem("oldPage")))
});

function drop() {
    wixData.query('Careers').ascending('title').find().then((results) => {
        let array = []
        let arrayO = getPosition(results.items)
        for (let i = 0; i < results.items.length; i++) {
            array.push({ label: arrayO[i], value: arrayO[i] })
        }
        $w('#position').options = array
    }).catch((err) => console.log(err))
}

function getPosition(array) {
    let arrayReturn = []
    for (let i = 0; i < array.length; i++) {
        if (!(arrayReturn.includes(array[i].title))) arrayReturn.push(array[i].title)
    }
    return arrayReturn
}

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