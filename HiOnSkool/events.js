import wixData from 'wix-data';
import { contacts } from 'wix-crm-backend';

// EVENT WHEN THERE IS A NEW MEMBER AND SAVE IN THE COLLECTIONS "MEMBERS"
export async function wixMembers_onMemberCreated(event) {
    console.log(event)
    let role = await getRole(event.entity._id);
    let json = {
        name: event.entity.contactDetails.firstName,
        surname: event.entity.contactDetails.lastName,
        role: role,
        privateId: event.entity._id,
        email: event.entity.loginEmail
    }
    console.log(json)
    let options = {
        "suppressAuth": true,
        "suppressHooks": true
    };

    wixData.insert("Members", json, options).then((item) => console.log(item))
        .catch((err) => console.log(err));
}

// GET ROLE FROM THE CONTACT
export function getRole(id) {
    const contactId = id;
    const options = {
        suppressAuth: true
    };

    return contacts.getContact(contactId, options).then((contact) => {
            return contact.info.extendedFields['custom.role'];
        }).catch((error) => console.error(error));
}