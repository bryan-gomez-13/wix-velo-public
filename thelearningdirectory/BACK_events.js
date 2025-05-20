import { saveMember } from 'backend/collections.web.js'

export function wixMembers_onMemberCreated(event) {
    saveMember(event.metadata.entityId)
}