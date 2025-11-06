import { insertCollection } from 'backend/collections.web.js';
import { createFolder } from 'backend/functions.web.js';

export async function wixMembers_onMemberCreated(event) {
    // insertCollection('Catch', { object: event })

    const newFolder = await createFolder("b78a1d3d3eda4d0880cd63bb06f03f0c", event.entity.loginEmail)

    const json = {
        firstName: event.entity.contact.firstName,
        surname: event.entity.contact.lastName,
        emailAddress: event.entity.loginEmail,
        memberId: event.entity._id,
        redirect: false,
        folderId: newFolder
    }

    insertCollection('Members', json)
}