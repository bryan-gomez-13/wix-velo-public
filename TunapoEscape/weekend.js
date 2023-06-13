import wixData from 'wix-data';
var day, days
$w.onReady(function () {
    //console.log($w('#date1').value)
    $w('#date1').onChange(() => {
        $w('#price').value = "";
        $w('#date2').disable();
        $w('#date2').value = null
        $w('#date2').minDate = $w('#date1').value
        $w('#date2').enable();
        if ($w('#date2').value) getDate()
    })
    $w('#date2').onChange(() => getDate())
    getPrices();
});

function getDate() {
    $w('#message').hide();
    let x = $w('#date1').value
    let y = $w('#date2').value
    let z = (y.getTime() - x.getTime()) / (1000 * 60 * 60 * 24);
    let pr = 0
    if(z < 2) pr = z*day
    else pr = z*days
    $w('#price').value = "$"+pr

    if (x.getDay() == 6 || x.getDay() == 0 || y.getDay() == 6 || y.getDay() == 0) {
        if (!(z >= 2)) {
            $w('#send').disable();
            $w('#message').text = 'The minimum reservation for weekends is 2 nights.'
            $w('#message').show();
        }else $w('#send').enable();
    }
}

function getPrices() {
    wixData.query('PricePerNights').find().then((prices) => {
        prices.items.forEach(price => {
            if(price._id == "f78e6c36-411f-4580-81c7-c80572317d8a") days = price.price
            else day = price.price
        })
    }).catch((err) => console.log(err))
}