import { authorization } from 'wix-members-backend';

export function wixMembers_onMemberCreated(event) {
    let typeEmail = event.entity.loginEmail.split('@')
    if (typeEmail[1].includes('.mil') || typeEmail[1].includes('.gov')) {
        myAssignRoleFunction(event.entity._id)
    }
}

export function myAssignRoleFunction(id) {
    const roleId = "e5b1a45c-f516-4d34-95aa-da04e8377c9b";
    const memberId = id;
    const options = {
        suppressAuth: false
    };

    return authorization.assignRole(roleId, memberId, options)
        .then(() => {
            console.log("Role assigned to member");
        })
        .catch((error) => {
            console.error(error);
        });
}