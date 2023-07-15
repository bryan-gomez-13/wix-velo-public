import wixPay from 'wix-pay';
import { createMyPayment, saveGift } from 'backend/functions';

$w.onReady(function () {
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
    if (!$w('#email').valid) throw new Error('Missing Address');
	if (!$w('#name').valid) throw new Error('Missing Name');
}

function payAmount() {
    createMyPayment(25)
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
                            address: $w('#email').value,
							nameForm: $w('#name').value,
                            message: $w('#messageForm').value,
                            namePayment: result.userInfo.firstName + " " + result.userInfo.lastName,
                            addressPayment: result.userInfo.email,
                            phone: result.userInfo.phone,
                            country: result.userInfo.country,
                        }

                        await saveGift(toInsert);
                        $w('#box').changeState('thankYou')
                    } else {
                        $w('#message').text = result.status
                        $w('#message').show();
                        setTimeout(() => $w('#message').hide(), 5000);
                    }
                });
        });
}