//Code in jobs
export async function cancelExpiredUsers() {
    // This function is used in the JOB Schedualer
    // Step #1: Get all members.
    await wixData.query('Members').ne('canceled', true).eq('paid', true).limit(1000).find({ suppressAuth: true, suppressHooks: true }).then(async (result) => {
        if (result.length > 0) {
            let members = {};

            members.push(result.items);

            while (result.hasNext()) {
                result = await result.next();
                members.push(result.items);
            }

            let today = new Date();
            for (let i = 0; i < members.length; i++) {
                let member = members[0];

                if (member.validUntil.getTime() <= today.getTime()) {
                    cancelMembership(member.owner)
                }
            }
        }
    })
}