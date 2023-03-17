import wixData from 'wix-data';
import wixPay from 'wix-pay';
import { createMyPayment } from 'backend/Payment.jsw'

$w.onReady(function () {
    drop();
    init();
});

function init() {
    $w('#email').onInput(() => getBlockEmail());
    $w('#crew').onChange(() => $w('#crewV').value = $w('#crewV').value);
    //$w('#captcha').onVerified(() => $w('#savePost').enable());

    // Filtering pay
    $w('#checkFilter').onChange(() => payment())
    $w('#pay').onClick(() => pay());
}

async function getBlockEmail() {
    await wixData.query("Blockemail").eq('title', $w('#email').value).find()
        .then((results) => {
            if (results.items.length > 0) $w('#savePost').disable();
            else $w('#savePost').enable();
        }).catch((err) => console.log(err));
}

async function drop() {
    await wixData.query("Crew").ascending('order').find()
        .then((results) => {
            let array = []
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i]._id + "$" + results.items[i].title })
            }
            $w('#crew').options = array;
        }).catch((err) => console.log(err))
}

function pay() {
    createMyPayment()
        .then((payment) => {
            wixPay.startPayment(payment.id)
                .then(async (result) => {
                    if (result.status === "Successful") {
                        $w('#checkFilter').disable();

                        $w('#email').value = result.userInfo.email
                        $w('#paymentEmail').value = result.userInfo.email

                        $w('#pay').collapse();
                        //$w('#captcha').expand();
                        $w('#savePost').expand();

                        let toInsert = {
                            "firstName": result.userInfo.firstName,
                            "lastName": result.userInfo.lastName,
                            "email": result.userInfo.email,
                            "phone": result.userInfo.phone,
                            "status": result.status,
                            "transactionId": result.transactionId,
                            "ok": false,
                        };
                        await wixData.insert("Payments", toInsert).then((item) => console.log(item)).catch((err) => console.log(err));
                    }
                });
        });
}

function payment() {
    if ($w('#checkFilter').checked) {
        $w('#pay').expand();
        //$w('#captcha').collapse();
        $w('#savePost').collapse();
    } else {
        $w('#pay').collapse();
        //$w('#captcha').expand();
        $w('#savePost').expand();
    }
}