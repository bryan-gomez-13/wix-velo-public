import wixPay from 'wix-pay';
import { createMyPayment, saveInfo } from 'backend/functions';

$w.onReady(function () {
    $w('#amount').onInput(() => {
        if ($w('#amount').value > 0) $w('#pay').enable();
        else $w('#pay').disable();
    })

    $w('#pay').onClick(() => {
        $w('#message').hide();
        $w('#pay').disable()
        $w('#loading').show();
        try {
            check();
            payAmount();
        } catch (err) {
            $w('#loading').hide();
            $w('#message').text = err.message;
            $w('#message').show();
            $w('#pay').enable();
        }
    })

});

function check() {
    if (!($w('#amount').value > 0)) throw new Error('Missing Put donation');
    if (!$w('#addressForm').valid) throw new Error('Missing Address');
}

function payAmount() {
    createMyPayment(parseInt($w('#amount').value))
        .then((payment) => {
            wixPay.startPayment(payment.id, { "showThankYouPage": false })
                .then(async (result) => {
                    //console.log(result)
                    if (result.status === "Successful" || result.status === "Offline") {
                        let toInsert = {
                            transactionId: result.transactionId,
                            status: result.status,
                            amount: result.payment.amount,
                            currency: result.payment.currency,
                            paymentId: result.payment.id,
                            address: $w('#addressForm').value,
                            message: $w('#messageForm').value,
                            name: result.userInfo.firstName + " " + result.userInfo.lastName,
                            addressPayment: result.userInfo.email,
                            phone: result.userInfo.phone,
                            country: result.userInfo.country,
                        }

                        await saveInfo(toInsert);
                        $w('#amount').value = 0 + ""
                        $w('#box').changeState('thankYou')
                    } else {
                        $w('#message').text = result.status
                        $w('#message').show();
                        setTimeout(() => $w('#message').hide(), 5000);
                    }
                });
        });
}