import { Permissions, webMethod } from "wix-web-module";
import { getContactInfo } from 'backend/functions.web.js'
import wixData from 'wix-data';

var wixDataOptions = { suppressAuth: true, suppressHooks: true, }
// ============================================================= CREATE =============================================================
export const saveMember = webMethod(Permissions.Anyone, async (contactId) => {
    getContactInfo(contactId).then(async (contactInfo) => {
        const json = {
            "firstName": contactInfo.info.name.first,
            "lastName": contactInfo.info.name.last,
            "email": contactInfo.primaryInfo.email,
            "about": contactInfo.info.extendedFields["custom.how-did-you-hear-about-us"],
            "gender": contactInfo.info.extendedFields["custom.are-you"],
            "born": contactInfo.info.extendedFields["custom.number-of-courses-you-advertise-year"],
            "terms": true,
            "privacy": true,
        }
        await wixData.insert("customSignup", json, wixDataOptions)
    })
});

export const saveClubsAndGroups = webMethod(Permissions.Anyone, async (json) => {
    return await wixData.insert("ClubsandCommunity", json, wixDataOptions).then((result) => { return result._id });
});

export const saveBanner = webMethod(Permissions.Anyone, async (json) => {
    return await wixData.insert("Banner", json, wixDataOptions).then((result) => { return result._id });
});

// ============================================================= READ =============================================================
export const getPlan3Courses = webMethod(Permissions.Anyone, async () => {
    const dnow = new Date();
    return await wixData.query("AllCourses").eq('plan', '13b985c8-bef6-454e-90bf-7fb562ff6cb3').eq('active', true).ge('dateFinalCourse', dnow).find().then(results => { return results.items })
});

export const getBanner = webMethod(Permissions.Anyone, async (field) => {
    const dnow = new Date();
    return await wixData.query("Banner").eq('active', true).ge('dateFinal', dnow).eq(field, true).find().then(results => { return results.items })
});

export const getBannerValidation = webMethod(Permissions.Anyone, async () => {
    return await wixData.query("Code").eq('_id', 'b1c01cec-786c-494b-9466-e358a62e5f9e').find().then((results) => { return results.items[0].status })
});

export const queryPlan = webMethod(Permissions.Anyone, async (field) => {
    return await wixData.query("Banner").eq('active', true).eq(field, true).find().then((results) => {
        if (results.items.length > 0) return { status: true, message: "We're sorry, this banner space is currently utilised.\nPlease select a banner on another page or email us for availability on contact@linkandlearn.nz" }
        else return { status: false, message: "Message" }
    }).catch((err) => { console.log(err) });
});

export const getEmail = webMethod(Permissions.Anyone, async () => {
    return await wixData.query("Emails").eq("status", true).limit(10).find().then((results) => { return results.items.map((item) => item.emailId) })
});

export const generalQuery = webMethod(Permissions.Anyone, async (collectionId, fieldId, valueId) => {
    return await wixData.query(collectionId).eq(fieldId, valueId).find().then((results) => { return results.items[0] })
});

// ============================================================= UPDATE =============================================================
export const updateBanner = webMethod(Permissions.Anyone, async (id) => {
    return await wixData.query("Banner").eq('_id', id).find().then(async (results) => {
        let banner = results.items[0];
        banner.clicks++
        await wixData.update("Banner", banner, wixDataOptions)
    })
});

export const updateTemplate = webMethod(Permissions.Anyone, async (json) => {
    return await wixData.query("AllCourses").eq('_id', json._id).find().then(async (results) => {
        let item = results.items[0];
        item.startTime = json.startTime;
        item.finalTime = json.finalTime;
        item.plan = json.plan;
        item.planName = json.planName;
        item.dateFinalCourse = json.dateFinalCourse;
        item.metaTitle = json.metaTitle;
        item.metaDescription = json.metaDescription;
        item.urlSlug = json.urlSlug;

        await wixData.update("AllCourses", item, wixDataOptions)
    })

    // return await wixData.query("Categories").eq("name", json.category).find().then(async (category) => {
    //     const categoryInfo = category.items[0];
    //     return await wixData.query("AllCourses").eq('_id', json._id).find().then((results) => {
    //         let item = results.items[0];
    //         item.startTime = json.startTime;
    //         item.finalTime = json.finalTime;
    //         item.plan = json.plan;
    //         item.planName = json.planName;
    //         item.dateFinalCourse = json.dateFinalCourse;
    //         item.categoryRef = categoryInfo._id;
    //         item.categoryUrl = categoryInfo.categoryUrl;
    //         wixData.update("AllCourses", item, wixDataOptions)
    //     })
    // })
});