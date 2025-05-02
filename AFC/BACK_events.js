import { insertCollection } from 'backend/collections.web.js';

export function wixMembers_onMemberCreated(event) {
    // insertCollection('Catch', { object: event })
    const json = {
        firstName: event.entity.contact.firstName,
        surname: event.entity.contact.lastName,
        emailAddress: event.entity.loginEmail,
        memberId: event.entity._id,
        redirect: false
    }
    insertCollection('Members', json)
}