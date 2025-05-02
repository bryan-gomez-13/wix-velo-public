import wixData from 'wix-data';
import { sendEmail } from 'backend/email.web.js';
import { updateCollection } from 'backend/collections.web.js';

export function BoatsForSale2_afterUpdate(item, context) {
    if (!item.sendEmail) return;
    item.emailSent = false;

    wixData.queryReferenced("BoatsForSale2", item._id, "favorite").then((results) => {
        if (results.items.length === 0) return;

        const { title, ['link-boats-for-sale2-title']: boatLink } = item;

        const variables = results.items.map(({ name, _id }) => ({
            variables: {
                boatName: title,
                userName: name || "Boating Enthusiast",
                boatLink: `https://www.parkermarinegroup.co.nz${boatLink}`,
                siteUrl: "https://www.parkermarinegroup.co.nz/"
            },
            privateId: _id
        }));

        sendEmail(variables).then(() => {
            item.sendEmail = false;
            item.emailSent = true;
            updateCollection('BoatsForSale2', item);
        })
    }).catch(console.error);
}