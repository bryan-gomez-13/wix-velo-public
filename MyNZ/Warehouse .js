import { eMail_5 } from 'backend/emails.jsw';
import wixData from 'wix-data';
var emailMember;

$w.onReady(async function () {
    methods();
});

// ADD FUNCTION IN EACH BUTTON
function methods() {
    $w('#emailB').onClick(() => getMember());
    $w('#saveItems').onClick(() => saveItems());
    //Email 5
    $w('#newPackage').onClick(() => newPackage());
}

//================================================== ADD PRODUCT ==================================================
// GET USER
export function getMember() {
    wixData.query("Users").eq("email", $w('#email').value).eq('active',true).or(wixData.query("Users").eq('suiteId', $w('#email').value).eq('active',true))
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                //ADD BOX ITEMS
                $w('#functions').expand();
                //console.log(results.items[0]);
                //console.log(results.items[0].mobile);
                showMember(results.items[0]);
            } else {
                $w('#functions').collapse();
                hideElements();
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}

//DATA OF THE MEMBER
function showMember(member) {
    $w('#name').text = "Name: " + member.fullName + " " + member.surname;
    $w('#mail').text = "Email:" + member.email;
    $w('#suite').text = "Suite:" + member.suiteId;
    emailMember = member.email;
}

//NORMAL
function hideElements() {
    $w('#name').text = "Name:";
    $w('#mail').text = "Email:";
    $w('#suite').text = "Suite:";
}

// SAVE ITEM IN THE MEMBER
async function saveItems() {
    //console.log(Member);
    //let validate = await isValidForm();
    //if (validate) {
    //console.log("save")
    $w('#Bad').hide();

    $w("#Products").save();

    //Volume
    let L = $w('#L').value;
    let W = $w('#W').value;
    let H = $w('#H').value;
    let volume = parseFloat(((parseFloat(L) * parseFloat(W) * parseFloat(H)) / 4500).toFixed(2));
    //console.log(volume);

    //Chargeable Weight
    let chargeableWeight = 0;
    if (parseFloat(volume) > parseFloat($w('#IWeight').value)) {
        chargeableWeight = volume;
    } else {
        chargeableWeight = parseFloat($w('#IWeight').value);
    }

    //Price and total
    let totalPrice = parseFloat($w('#IPrice').value) * parseFloat($w('#IQuantity').value);
    let unitPrice = parseFloat($w('#IPrice').value);

    let json = {
        "user": emailMember,
        "dimensions": $w('#L').value + "x" + $w('#W').value + "x" + $w('#H').value,
        "volume": volume,
        "shippingOption": "Pending",
        "taxesName": "taxesName",
        "taxesRate": "0",
        "taxesCode": "taxesCode",
        "packageArrival": $w('#IPArrival').value.toDateString(),
        "chargeableWeight": chargeableWeight,
        "unitPrice": unitPrice,
        "totalPrice": totalPrice.toFixed(2),
        "notification": false
    }
    //console.log(json)

    $w("#Products").setFieldValues(json)

    let idProduct = $w("#Products").getCurrentItem()._id

    //console.log($w("#Products").getCurrentItem());
    //console.log(idProduct);

    wixData.query("Users")
        .eq("email", emailMember)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                let id = results.items[0]._id; //see item below
                //console.log(results.items[0])
                //console.log(id)
                //console.log(idProduct)
                wixData.insertReference("Users", "myProducts", id, idProduct)
                    .then(() => {
                        //console.log("Reference inserted 1");
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });

    $w('#Good').show();
    clear();
    /*} else {
        $w('#Bad').show();
        $w('#Good').hide();
    }*/
}

function clear() {
    $w('#IQuantity').value = "";
    $w('#IPrice').value = "";
    $w('#IWeight').value = "";
    $w('#IPDetail').value = "";
    $w('#notesToCustomer').value = "";
    $w('#IPArrival').resetValidityIndication();
    $w('#L').value = "";
    $w('#W').value = "";
    $w('#H').value = "";
    $w('#ISupplier').value = "";
    $w('#IInvoiceReference').value = "";
    $w('#INZLocalShippingReference').value = "";
    $w('#IBrand').value = "";
}

/*export async function isValidForm() {
    /*console.log($w('#IName').valid);
    console.log($w('#IQuantity').valid);
    console.log($w('#IPrice').valid);
    console.log($w('#IWeight').valid);
    console.log($w('#IPDetail').valid);
    console.log($w('#IDescription').valid);
    console.log($w('#notesToCustomer').valid);
    console.log($w('#IPArrival').valid);
    console.log($w('#L').valid);
    console.log($w('#W').valid);
    console.log($w('#H').valid);
    console.log($w('#ISupplier').valid);
    console.log($w('#IInvoiceReference').valid);
    console.log($w('#INZLocalShippingReference').valid);
    console.log($w('#IBrand').valid);

    let result = false;
    if (($w('#IName').valid && $w('#IName').value != "") && ($w('#IQuantity').valid && $w('#IQuantity').value != "") && ($w('#IPrice').valid && $w('#IPrice').value != "") && ($w('#IWeight').valid && $w('#IWeight').value != "") && ($w('#IPDetail').valid && $w('#IPDetail').value != "") && ($w('#IDescription').valid && $w('#IDescription').value != "") && ($w('#notesToCustomer').valid && $w('#notesToCustomer').value != "") && ($w('#L').valid && $w('#L').value != "") && ($w('#W').valid && $w('#W').value != "") && ($w('#H').valid && $w('#H').value != "") && ($w('#ISupplier').valid && $w('#ISupplier').value != "") && ($w('#IInvoiceReference').valid && $w('#IInvoiceReference').value != "") && ($w('#IBrand').valid && $w('#IBrand').value != "")) {
        result = true;
    }
    console.log(result);
    return result;
}*/

// ======================= EMAIL_5 - NEW PACKAGE =======================
async function newPackage() {
    //console.log(emailMember)
    $w('#alert').collapse();
    await wixData.query("Products").eq('user', emailMember).eq('notification', false)
        .find()
        .then(async (results) => {
            if (results.items.length > 0) {
                $w('#alert').text = "Saving information";
                $w('#alert').expand();
                let suppliers = [];
                let supplier = "";
                for (let i = 0; i < results.items.length; i++) {
                    results.items[i].notification = true;
                    await wixData.update("Products", results.items[i])
                    if (!suppliers.includes(results.items[i].supplier)) {
                        suppliers.push(results.items[i].supplier);
                        if (i == (results.items.length - 1)) {
                            supplier += results.items[i].supplier;
                        } else {
                            supplier += results.items[i].supplier + ", ";
                        }
                    }
                }

                //console.log(supplier);

                await wixData.query('Users').eq('email', emailMember).find().then(async (result) => {
                    let json = {
                        idPrivateMember: result.items[0].idPrivateMember,
                        fullName: result.items[0].fullName,
                        supplier: supplier,
                        suiteId: result.items[0].suiteId
                    }
                    //console.log(json)
                    await eMail_5(json)
                })
                $w('#alert').text = "Done";

            } else {
                $w('#alert').text = "The customer has no new products";
                $w('#alert').expand();
            }
        })
        .catch((err) => {
            let errorMsg = err;
        });
}