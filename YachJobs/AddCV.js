import wixData from 'wix-data';
import wixWindow from 'wix-window';
import { createContact } from 'backend/contact.jsw'
var info

$w.onReady(function () {
    drop();
    init();

});

function init() {
    // exp value
    $w('#exp').onChange(() => {
        if ($w('#exp').value == 'New to yachting') $w('#expV').value = 0 + ''
        else if ($w('#exp').value == '6-month experience') $w('#expV').value = 0.5 + ''
        else if ($w('#exp').value == '1 years experience') $w('#expV').value = 1 + ''
        else if ($w('#exp').value == '2 years experience') $w('#expV').value = 2 + ''
        else if ($w('#exp').value == '3 years experience') $w('#expV').value = 3 + ''
        else if ($w('#exp').value == '4 years experience') $w('#expV').value = 4 + ''
        else if ($w('#exp').value == '5 years experience +') $w('#expV').value = 5 + ''
    })
    // longest employment value
    $w('#longEmploy').onChange(() => {
        if ($w('#longEmploy').value == '3 months') $w('#longEmployV').value = 0.25 + ''
        else if ($w('#longEmploy').value == '6-months') $w('#longEmployV').value = 0.5 + ''
        else if ($w('#longEmploy').value == '1 year') $w('#longEmployV').value = 1 + ''
        else if ($w('#longEmploy').value == '2 years') $w('#longEmployV').value = 2 + ''
        else if ($w('#longEmploy').value == '3 years') $w('#longEmployV').value = 3 + ''
        else if ($w('#longEmploy').value == '4 years') $w('#longEmployV').value = 4 + ''
        else if ($w('#longEmploy').value == '5 years+') $w('#longEmployV').value = 5 + ''
    })
    // Get block emails
    $w('#email').onInput(() => getBlockEmail())
    // save variable
    $w('#save').onMouseIn(() => {
        info = {
            name: $w('#name').value,
            email: $w('#email').value,
            exp: $w('#expV').value,
            long: $w('#longEmployV').value,
            position: $w('#crew').value
        }
    })
    // save cv
    $w('#save').onClick(async () => {
        $w('#save').disable();
        $w('#image1').show();
        $w('#text117').hide();
        $w('#text116').hide();

        await $w('#dataset').save().then(async (item) => {
            //console.log(item)
            await wixData.query("CVs").eq('_id', item._id).find()
                .then(async (results) => {
                    if (results.items.length > 0) {
                        results.items[0].exp = info.exp
                        results.items[0].longest = info.long
                        await wixData.update("CVs", results.items[0])
                    }
                }).catch((err) => console.log(err));
        });
    })
    // error when save
    $w('#dataset').onError(() => {
        $w('#save').enable();
        $w('#text117').show();
        $w('#image1').hide();
    })
    // after save
    $w('#dataset').onAfterSave(async () => {
        console.log()
        await createContact(info)
        $w('#text116').show();
        wixWindow.lightbox.close()
    })
    // bots
    //$w('#captcha').onVerified(() => $w('#save').enable())
}

async function drop() {
    await wixData.query("Crew").ascending('order').find()
        .then((results) => {
            let array = []
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#crew').options = array;
        }).catch((err) => console.log(err))
}

async function getBlockEmail() {
    await wixData.query("Blockemail").eq('title', $w('#email').value).find()
        .then((results) => {
            if (results.items.length > 0) $w('#save').disable();
            else $w('#save').enable();
        }).catch((err) => console.log(err));
}