import wixData from "wix-data";
import { contacts, triggeredEmails } from 'wix-crm-backend';
import { Permissions, webMethod } from 'wix-web-module';
import { members } from 'wix-members-backend';

// ================================ Wix form for Sales Enquiry ================================
export async function getCountryOrCity(filter) {
    return await wixData.query("Country").contains("continentCountry", filter).limit(1000).ascending('title').find().then((result) => {
        if (result.items.length > 0) {
            let items = result.items;
            let arrayI = [];
            let array = [];
            for (let i = 0; i < items.length; i++) {
                if (arrayI.includes(items[i].title) == false) {
                    arrayI.push(items[i].title);
                    array.push({
                        label: items[i].title,
                        value: items[i]._id,
                    });
                }
            }
            return array;
        } else return false;
    });
}

export async function getStateCountry() {
    return await wixData.query("Country").limit(1000).ascending('continentCountry').find().then((result) => {
        if (result.items.length > 0) {
            let items = result.items;
            let arrayI = [];
            let array = [];
            for (let i = 0; i < items.length; i++) {
                if (arrayI.includes(items[i].continentCountry) == false) {
                    arrayI.push(items[i].continentCountry);
                    array.push({
                        label: items[i].continentCountry,
                        value: items[i].continentCountry,
                    });
                }
            }
            return array;
        } else return false;
    });
}

// =========================================================== SEND FORM
export async function sendSalesEnquiry(jsonEmail) {
    //console.log(jsonEmail)
    const idUser = await getEmailSalesEnquiry(jsonEmail.region, jsonEmail.form);
    const formAll = await getEmailSalesEnquiry("Principal Email", jsonEmail.form);

    const emailId = "salesEnquiry";
    const options = { variables: jsonEmail };

    await triggeredEmails.emailMember(emailId, idUser, options).then(() => console.log('Member 1'))
        .catch((error) => { console.error("error M", error) });

    await triggeredEmails.emailMember(emailId, formAll, options).then(() => console.log('Member All'))
        .catch((error) => { console.error("error M", error) });
}

export async function getEmailSalesEnquiry(region, form) {
    return wixData.query('RegionCountry').eq('title', region).hasSome('form', form).find().then((results) => {
        return results.items[0].privateId;
    })
}

export async function myQueryContactsFunction(email) {
    try {
        const queryResults = await contacts.queryContacts().eq("info.emails.email", email).find({ suppressAuth: true });
        return queryResults.items;
    } catch (error) { console.error(error); }
}

// Get Dropdown for each category in products
export async function getDropdowns(category) {
    const dropSolutions = await getDistinctValues('solutions', category);
    const dropSC = await getDistinctValues('subCategory', category);
    return { dropSolutions, dropSC };
}

async function getDistinctValues(field, category) {
    let optionsWixData = {
        "suppressAuth": true,
        "suppressHooks": true
    };

    let results = await wixData.query('Products').eq('category', category).ascending(field).limit(1000).find(optionsWixData);
    let allValues = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allValues = allValues.concat(results.items);
    }

    const distinctValues = Array.from(new Set(allValues.flatMap(item => item[field])));
    return distinctValues.map(value => ({ label: value, value }));
}

// ================================ Get category of Marketing ================================
export async function getMarketingSubCategory(category) {
    await wixData.query('ChannelMarketing').eq('category', category).find().then((results) => {
        return results.items
    }).catch((err) => console.log(err))

    let results = await wixData.query('ChannelMarketing').eq('category', category).limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    let subCategories = [];
    let array = [];
    allItems.forEach((item) => {
        if (!(array.includes(item.subCategory[0]))) {
            subCategories.push({ label: item.subCategory[0], value: item.subCategory[0] });
            array.push(item.subCategory[0]);
        }
    });
    return subCategories;
}

