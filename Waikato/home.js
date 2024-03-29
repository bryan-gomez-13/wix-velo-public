import { createMyPayment, sendEmail } from 'backend/functions';
import wixData from 'wix-data';
import wixPay from 'wix-pay';
import wixLocation from 'wix-location';

$w.onReady(function () {

    wixData.query('Variable').find()
        .then((result) => {
            let one, two, three
            for (let i = 0; i < result.items.length; i++) {
                if (result.items[i]._id == "eec21b06-7f34-4264-a8ac-67f8edd3d3db") one = result.items[i].value
                else if (result.items[i]._id == "a9758a50-319a-4225-878c-8ae66659faa1") two = result.items[i].value
                else if (result.items[i]._id == "0fdfa142-fd23-4562-91a2-deaea7cb9e60") three = result.items[i].value
            }
            $w('#OneBox').onClick(() => more(one));
            $w('#TwoBox').onClick(() => more(two));
            $w('#ThreeBox').onClick(() => more(three));
        })

    $w('#pay').onClick(() => checkAddress())
});

function more(money) {
    if (parseInt($w('#amount').value) == 0) $w('#amount').value = money
    else $w('#amount').value = parseInt($w('#amount').value) + money
}

function checkAddress() {
    $w('#message').hide();
    $w('#pay').disable()
    try {
        check();
        //console.log($w('#address').value)
        payAmount();
    } catch (err) {
        $w('#message').text = err.message;
        $w('#message').show();
        $w('#pay').enable();
    }
}

function check() {
    if (!$w('#address').valid) throw new Error('Missing address');
    if (!($w('#address').value.city)) throw new Error('Missing select address');
}

function payAmount() {
    createMyPayment(parseInt($w('#amount').value))
        .then((payment) => {
            wixPay.startPayment(payment.id, { "showThankYouPage": false })
                .then(async (result) => {
                    //console.log(result)
                    if (result.status === "Successful" || result.status === "Offline") {
                        await wixData.query('Donation').descending('_createdDate').find().then(async (donation) => {
                            let lastValue = donation.items[0].internalReceipt;
                            let prefix = lastValue[0];
                            let numberStr = lastValue.slice(1);
                            let number = parseInt(numberStr);
                            let nextNumber = number + 1;
                            let nextNumberStr = nextNumber.toString().padStart(numberStr.length, "0");
                            let nextValue = prefix + nextNumberStr;
                            let toInsert = {
                                status: result.status,
                                transactionId: result.transactionId,
                                name: result.userInfo.firstName + " " + result.userInfo.lastName,
                                country: result.userInfo.country,
                                phone: result.userInfo.phone,
                                email: result.userInfo.email,
                                amount: result.payment.amount,
                                currency: result.payment.currency,
                                recibeEmails: $w('#recibeEmails').checked,
                                internalReceipt: nextValue,
                                address: $w('#address').value.formatted
                            }
                            if ($w('#note').value.length > 0) toInsert.note = $w('#note').value
                            await wixData.insert("Donation", toInsert)
                                .then(async () => {
                                    $w('#amount').value = 0 + ""
                                    await sendEmail(toInsert)
                                    wixLocation.to('/thank-you')
                                }).catch((err) => console.log(err));
                            
                        }).catch((err) => console.log(err))
                    } else {
                        $w('#message').text = result.status
                        $w('#message').show();
                        setTimeout(() => $w('#message').hide(), 5000);
                    }
                });
        });
}