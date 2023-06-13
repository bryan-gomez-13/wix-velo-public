import { contacts } from 'wix-crm-backend';
import wixData from 'wix-data';
/*
"custom.pool-owner-soon-to-be-pool-owner"
"custom.retailer-distributor"
"custom.subscriptions"
*/

export async function wixCrm_onContactCreated(event) {
    let option = {
        "suppressAuth": true,
        "suppressHooks": true
    };

    //console.log(event)
    let labelkeys = ["custom.subscriptions"]
    await wixData.query("subscribers09").eq('enterYourEmailAddress', event.entity.primaryInfo.email).descending('_createdDate').find(option)
        .then((results) => {
            //console.log(results.items[0])
            if (results.items.length > 0) {
                for (let i = 0; i < results.items[0].multiCheckboxField.length; i++) {
                    if (results.items[0].multiCheckboxField[i] == "Pool owner/soon to be pool owner") labelkeys.push("custom.pool-owner-soon-to-be-pool-owner")
                    else labelkeys.push("custom.retailer-distributor")
                }
            } else {
                console.log('Nonas')
            }
        }).catch((err) => console.log('No exist', err));

    //console.log(labelkeys)
    let revisionN = await myGetContactFunction(event.metadata.entityId)
    //console.log(revisionN)
    let revision = revisionN+1
    //console.log(revision)

    const contactIdentifiers = {
        contactId: event.metadata.entityId,
        revision: revision
    };
    //console.log(labelkeys)
    const contactInfo = {
        labelKeys: labelkeys
    };
    const options = {
        allowDuplicates: false,
        suppressAuth: false
    };

    //console.log('UPDATE-1')
    //console.log(contactIdentifiers)
    //console.log(contactInfo)

    return contacts.updateContact(contactIdentifiers, contactInfo, options)
        .then((updatedContact) => {
            console.log('OK')
            return updatedContact;
        })
        .catch((error) => {
            console.error("error", error);
        });

}

export function myGetContactFunction(id) {
  const contactId = id;
  const options = {
    suppressAuth: true
  };

  return contacts.getContact(contactId, options)
    .then((contact) => {
      return contact.revision;
    })
    .catch((error) => {
      console.error(error);
    });
}