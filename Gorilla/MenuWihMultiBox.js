import wixData from 'wix-data';

$w.onReady(function () {

    $w('#BT0').onClick(() => {
        $w('#statebox8').changeState('S1');
        $w('#BBooster').hide();
        $w('#BPersonal').show();
    })
    $w('#BB0').onClick(() => {
        $w('#statebox8').changeState('S1');
        $w('#BBooster').hide();
        $w('#BPersonal').show();
    })

    $w('#BT1').onClick(() => {
        $w('#statebox8').changeState('S0');
        $w('#BBooster').show();
        $w('#BPersonal').hide();
    })

    $w('#BB1').onClick(() => {
        $w('#statebox8').changeState('S0');
        $w('#BBooster').show();
        $w('#BPersonal').hide();
    })

    $w('#BHeader').onClick(() => saveButton('BHeader'))
    $w('#BSectionFive').onClick(() => saveButton('BSectionFive'))
    $w('#BSectionSix').onClick(() => saveButton('BSectionSix'))

});

async function saveButton(idButton) {
    await wixData.query("Boostwebsiterevenue")
		.eq('idButton',idButton)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                console.log(results.items[0].clicks); //see item below
				results.items[0].clicks = results.items[0].clicks+1;
				console.log(results.items[0].clicks);
				wixData.update("Boostwebsiterevenue", results.items[0]);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}