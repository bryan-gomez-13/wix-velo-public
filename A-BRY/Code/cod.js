//Limitar elementos en un text
export function x() {
    let size = 80;
    $w('#rep').onItemReady(($product, product) => {
        if (product.description.length > size) {
            $product('#text4').text = `${product.description.substr(0, size)}...`;
        } else {
            $product('#text4').text = product.description;
        }
    })
}

// TIME
cart.showMiniCart();
setTimeout(() => cart.hideMiniCart(), 3000);

// Dropdown
async function dropdowns() {
    await wixData.query("NameCollection").ascending('title').find()
        .then((results) => {
            let array = [{ "label": "All", "value": "All" }];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i].title })
            }
            $w('#NameDropdown').options = array;
        }).catch((err) => console.log(err))
}

//FILTER
function filter() {
    let filter = wixData.filter();
    let sort = wixData.sort();
    //Name of the field
    if ($w('#search').value !== '') filter = filter.and(wixData.filter().eq("title", $w('#search').value));

    if ($w('#search').value !== '') filter = filter.and(wixData.filter().contains("title", $w('#search').value));

    if ($w('#sort').value == "A-Z") sort = sort.ascending("title");
    else sort = sort.descending("title");

    $w('#dynamicDataset').setFilter(filter);
    $w("#dynamicDataset").setSort(sort);
}

// OnClick events
$w('#less').onClick((event) => {
    // Opt 1
    let $item = $w.at(event.context);
    const itemId = event.context.itemId;
    const itemData = $w('#repCartPage').data.find(item => item._id == itemId)

    // Opt 2
    const eventInfo = categoryRepInfo.find(item => item._id == event.context.itemId);
});

//EMAIL
import { triggeredEmails } from 'wix-crm-backend';
export function email(User) {
    let emailId = "IDEmail";

    //Yourweb
    const idUser = "62bed798-b3b1-484e-a1b0-d2f8ec07de90";
    const options = {
        variables: {
            user: User["1ErNombre"] + " " + User["1ErApellido"],
            criminal: User.criminalRecord,
            legal: User.legalRecords,
            credit: User.creditScore,
        }
    }

    triggeredEmails.emailMember(emailId, idUser, options)
        .then(() => {
            console.log("Email Done")
        })
        .catch((error) => {
            console.error(error);
        });
}

// PERMISSIONS
const wixDataOptions = { "suppressAuth": true, "suppressHooks": true };

// Save pdf
export async function generatePDFnewYourweb(template_id, pdfData, updatedItem) {

    const api_key = await wixSecretsBackend.getSecret("api_key");
    var json_payload = JSON.stringify({
        "data": pdfData,
        "output_file": "output.pdf",
        "export_type": "json",
        "expiration": 1000,
        "template_id": template_id
    });

    return fetch("https://api.craftmypdf.com/v1/create", {
        "method": 'POST',
        "headers": {
            'Content-Type': 'application/json',
            "X-API-KEY": api_key
        },
        "body": json_payload
    })
        .then(response => response.json())
        .then(json => {
            console.log(json);
            let fileRecieved = json.file;
            console.log(fileRecieved);

            uploadFile(fileRecieved, updatedItem.firstName).then((fileDetails) => {
                console.log(fileDetails.fileUrl)

                let dataUpdateOptions = { "suppressAuth": true };

                wixData.get("MainCertificateDatabase", updatedItem._id, dataUpdateOptions).then(async (item) => {
                    item.medicalCertificate = fileDetails.fileUrl; // updated last name
                    wixData.update("MainCertificateDatabase", item, dataUpdateOptions);
                    console.log(item); //see item below

                    // 1 day 1440
                    let downloadLink = await getDownloadUrl(fileDetails.fileUrl, 1440, `https://www.midoc.com.au/resend-medical-certification?medicalCertificationId=${item._id}`);

                    if (item.personID) {
                        emailContactWithCertificate(item.personID, item.firstName, downloadLink)
                    } else if (!item.personID) {
                        queryContactForID(item.email)
                            .then((contactID) => {
                                emailContactWithCertificate(contactID, item.firstName, downloadLink)
                            })
                    }

                }).catch((err) => { console.log(err); });
            })
        });
}

import { mediaManager } from 'wix-media-backend';
export function uploadFile(url, name) {
    return mediaManager.importFile(
        "/allMedicalCertificates",
        url, {
        "mediaOptions": {
            "mimeType": "application/pdf",
            "mediaType": "document"
        },
        "metadataOptions": {
            "fileName": `${name}_medical_certificate.pdf`
        }
    }
    );
}

// ======================================================= BULK EMAIL SUBSCRIPTION
// Helper: split array into chunks of "size"
function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
// Get all contacts with pagination
export const getAllContacts = webMethod(Permissions.Anyone, async () => {
    let allContacts = [];
    let results = await contacts.queryContacts().limit(100).find();

    allContacts.push(...results.items);

    while (results.hasNext()) {
        results = await results.next(); // this already brings the next batch
        allContacts.push(...results.items);
    }

    return allContacts;
})

export const myBulkUpsertEmailSubscriptionMethod = webMethod(Permissions.Anyone, async () => {
    const items = await getAllContacts();

    const subscriptions = items
        .map(emailInfo => {
            const email = emailInfo?.info?.emails?.items?.[0]?.email;
            if (!email) return null; // skip if no email
            return {
                deliverabilityStatus: "VALID",
                email,
                subscriptionStatus: "SUBSCRIBED"
            };
        })
        .filter(item => item !== null);

    const elevatedBulkUpsertEmailSubscription = elevate(
        wixEmailSubscriptions.emailSubscriptions.bulkUpsertEmailSubscription
    );

    // Split into chunks of 100
    const chunks = chunkArray(subscriptions, 100);

    let results = [];
    for (const chunk of chunks) {
        try {
            const res = await elevatedBulkUpsertEmailSubscription(chunk);
            results.push(res);
        } catch (err) {
            console.error("Error on bulk upsert:", err);
        }
    }

    return results;
})