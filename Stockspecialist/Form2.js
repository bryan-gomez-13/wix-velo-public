import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { createMyPayment } from 'backend/pay';
import wixPay from 'wix-pay';
var id, fields

$w.onReady(function () {
    $w('#wixForms1').onWixFormSubmitted((form) => {
        $w('#button1').collapse();
        fields = form.fields
        pay(fields)
    })

    $w('#subscription').onClick(() => pay(fields))
});

function pay(fields) {
    createMyPayment()
        .then((payment) => {
            wixPay.startPayment(payment.id)
                .then(async (result) => {
                    id = await getForm(fields[0].fieldValue)
                    if (result.status === "Successful") {
                        wixData.query('jobApplication05').eq('_id', id).find().then((user) => {
                            let item = user.items[0]
                            item.payment = result.payment.amount + ' ' + result.payment.currency
                            item.transactionId = result.transactionId
                            item.transactionEmail = result.userInfo.email
                            item.transactionName = result.userInfo.firstName + ' ' + result.userInfo.lastName
                            item.transactionCountry = result.userInfo.country
                            item.transactionPhone = result.userInfo.phone
                            item.status = result.status

                            wixData.update('jobApplication05', item).then(() => wixLocation.to('/thank-you'))
                        })

                    } else {
                        $w('#message').text = result.status
                        $w('#message').show()
                        $w('#button1').collapse();
                        $w('#subscription').expand();
                    }
                });
        });
}

function getForm(email) {
    return wixData.query('jobApplication05').eq('email', email).descending('_createdDate').find().then((results) => { return results.items[0]._id })
}