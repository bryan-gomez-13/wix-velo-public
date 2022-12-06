import wixLocation from 'wix-location';

$w.onReady(function () {
    $w('#dynamicDataset').onReady(async () => {
        await $w('#repeater3').onItemReady(($chilli, chillidata) => {
            let smallS = 100;
            let bigS = 170;
            //console.log(chillidata)
            if (chillidata.uses.length > smallS) $chilli('#text31').text = `${chillidata.uses.substr(0, smallS)}...`;
            else $chilli('#text31').text = chillidata.uses;

            if (chillidata.description.length > bigS) $chilli('#text42').text = `${chillidata.description.substr(0, bigS)}...`;
            else $chilli('#text42').text = chillidata.description;

            $chilli('#button5').onClick(() => wixLocation.to(chillidata.linkShop))
        })
        $w('#repeater3').show();
    })
});