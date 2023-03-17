import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { createMyPayment } from 'backend/pay';
import wixPay from 'wix-pay';
var id, fields

$w.onReady(function () {
    $w('#wixForms1').onWixFormSubmitted((form) => {
        $w('#button14').collapse();
        fields = form.fields
        console.log(fields)
        pay(fields)
    })

    $w('#subscription').onClick(() => pay(fields))
});

function pay(fields) {
    // SELECT THE CORRECT FIELD
	let pago = parseInt(fields[6].fieldValue)
    createMyPayment(pago)
        .then((payment) => {
            wixPay.startPayment(payment.id)
                .then(async (result) => {
                    // SELECT THE CORRECT FIELD
                    id = await getForm(fields[4].fieldValue)
                    if (result.status === "Successful") {
                        wixData.query('contact112').eq('_id', id).find().then((user) => {
                            let item = user.items[0]
                            item.payment = result.payment.amount + ' ' + result.payment.currency
                            item.transactionId = result.transactionId
                            item.transactionEmail = result.userInfo.email
                            item.transactionName = result.userInfo.firstName + ' ' + result.userInfo.lastName
                            item.transactionCountry = result.userInfo.country
                            item.transactionPhone = result.userInfo.phone
                            item.status = result.status

                            wixData.update('contact112', item).then(() => wixLocation.to('/gracias-donacion'))
                        })

                    } else {
                        $w('#message').text = result.status
                        $w('#message').show()
                        $w('#button14').collapse();
                        $w('#subscription').expand();
                    }
                });
        });
}

function getForm(email) {
    return wixData.query('contact112').eq('email', email).descending('_createdDate').find().then((results) => { console.log(results); return results.items[0]._id })
}