import { Permissions, webMethod } from "wix-web-module";
import { submissions } from "wix-forms.v2";
import { elevate } from "wix-auth";
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true }
// ============================= CREATE
export const saveData = webMethod(Permissions.Anyone, async (collectionsId, json) => {
    return await wixData.insert(collectionsId, json, wixDataOptions).then((item) => { return item })
})

// ============================= READ
export const getCollection = webMethod(Permissions.Anyone, async (collectionId) => {
    let results = await wixData.query(collectionId).limit(100).find(wixDataOptions);
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const generalQuery = webMethod(Permissions.Anyone, async (collectionId, field, value) => {
    let results = await wixData.query(collectionId).eq(field, value).limit(100).find(wixDataOptions);
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

export const generalQuery_v2 = webMethod(Permissions.Anyone, async (collectionId, fieldId, value) => {
    let results = await wixData.query(collectionId).eq(fieldId, value).limit(1000).find();
    let allItems = results.items;
    while (results.hasNext()) {
        results = await results.next();
        allItems = allItems.concat(results.items);
    }
    return allItems;
})

// ============================= UPDATE
export const updateCollection = webMethod(Permissions.Anyone, async (collectionsId, json) => {
    return await wixData.update(collectionsId, json, wixDataOptions)
})

export const updateRemainingSpots = webMethod(Permissions.Anyone, async () => {
    const courses = [
        'db6aa99a-1a84-422a-a743-8951dbb07f16', // Agility
        '04abfc69-1e45-4c24-8cad-22e90fcfc559', // BabyPPS
        '78fbab14-7868-46f8-8801-f7e209761bc2', // L1DT
        '947f56a4-a236-47b1-a9df-c7f71e170886', // Level 2 Training Monday
        '71322720-ea65-4ed6-9163-f1643e4d1f4b', // Level 2 Training Tuesday
    ];

    // Fetch all course info
    const coursesInfo = (await wixData.query('Course').hasSome('_id', courses).find()).items;

    // Process each course in parallel and resolve all promises
    const itemsToUpdate = await Promise.all(
        coursesInfo.map(async (item) => {
            // Choose the correct status field
            const fieldStatus = item.collectionId === 'Level2Training' ? 'paymentStatus' : 'payment';

            // Build query to get all submissions since registration date
            let collectionSubmission = wixData.query(item.collectionId)
                .ge('_createdDate', item.registrationDate)
                .eq(fieldStatus, 'Paid');

            // Add preferred day filter if needed
            if (item.collectionId === 'Level2Training') {
                collectionSubmission = collectionSubmission.eq('preferedDay', item._id === '947f56a4-a236-47b1-a9df-c7f71e170886' ? 'Monday' : 'Tuesday');
            }

            // Execute query
            const { items } = await collectionSubmission.find();

            // Calculate remaining spots safely
            const totalCapacity = item.numberOfPeople || 0;
            item.remainingSpots = totalCapacity - items.length;

            return item;
        })
    );

    // Bulk update the course collection
    await wixData.bulkUpdate('Course', itemsToUpdate, wixDataOptions);
    await saveData('Catch',{title:'Ok'});

    return 'Ok';
})

export const lessOne = webMethod(Permissions.Anyone, async (courseId, collectionId, statusField) => {
    // Get course information
    let courseInfo = (await generalQuery('Course', '_id', courseId))[0];

    // Check if there are still spots available

    let collectionSubmission = wixData.query(collectionId).ge('_createdDate', courseInfo.registrationDate);

    // Optional: filter by status if provided
    // if (statusField) {
    //     collectionSubmission = collectionSubmission.eq(statusField, 'Paid');
    // }

    const { items } = await collectionSubmission.find();

    // Calculate remaining spots based on submissions
    courseInfo.remainingSpots = courseInfo.numberOfPeople - items.length;

    // Update course in the collection
    await updateCollection('Course', courseInfo);

    return { status: true };

})

export const lessOneLvL2 = webMethod(Permissions.Anyone, async (courseId, collectionId, statusField, preferedDay) => {
    // Get course information
    let courseInfo = (await generalQuery('Course', '_id', courseId))[0];

    // Check if there are still spots available

    let collectionSubmission = wixData.query(collectionId).ge('_createdDate', courseInfo.registrationDate).eq('preferedDay', preferedDay);

    // Optional: filter by status if provided
    // if (statusField) {
    //     collectionSubmission = collectionSubmission.eq(statusField, 'Paid');
    // }

    const { items } = await collectionSubmission.find();

    // Calculate remaining spots based on submissions
    courseInfo.remainingSpots = courseInfo.numberOfPeople - items.length;

    // Update course in the collection
    await updateCollection('Course', courseInfo);

    return { status: true };

})

export const lessOneWixForms = webMethod(Permissions.Anyone, async (courseId, collectionId, statusField) => {
    let [courseRequest, collectionSubmission] = await Promise.all([
        generalQuery('Course', '_id', courseId),
        getCollection(collectionId)
    ])

    let courseInfo = courseRequest[0];
    const referenceDate = new Date(courseInfo.registrationDate);
    const filtered = collectionSubmission.filter(item => new Date(item.createdDate) > referenceDate);

    // Calculate remaining spots based on submissions
    courseInfo.remainingSpots = courseInfo.numberOfPeople - filtered.length;

    // Update course in the collection
    await updateCollection('Course', courseInfo);

    return { status: true };

})

// export const updateLvl2Training = webMethod(Permissions.Anyone, async (email, status) => {
//     let results = await wixData.query("WixForms/3e3c011d-627a-4947-a877-1b2ae5d053d1").find(wixDataOptions);
//     let allItems = results.items;
//     while (results.hasNext()) {
//         results = await results.next();
//         allItems = allItems.concat(results.items);
//     }

//     const searchByEmail = allItems.filter(item => item.email_d952 == email)
//     searchByEmail.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

//     let updateItem = searchByEmail[0];
//     updateItem.payment_status = status;
//     wixData.update('WixForms/3e3c011d-627a-4947-a877-1b2ae5d053d1', updateItem, wixDataOptions)
//         .catch((err) => console.log(err))
// });

// export const updateLvl2Training2 = webMethod(Permissions.Anyone, async (email, status) => {
//     try {
//         const querySubmissions = elevate(submissions.querySubmissionsByNamespace);
//         const query = await querySubmissions().eq("namespace", "wix.form_app.form").eq("formId", "3e3c011d-627a-4947-a877-1b2ae5d053d1").descending("_createdDate").find();
//         console.log(query)
//         const searchByEmail = query.items.filter(item => item.submissions.email_d952 == email);
//         const item = searchByEmail[0];

//         let submissionsItems = item.submissions;
//         submissionsItems.payment_status = status;

//         const submission = {
//             formId: item.formId,
//             seen: false,
//             revision: item.revision,
//             submissions: submissionsItems
//         }

//         const elevatedUpdateSubmission = elevate(submissions.updateSubmission);
//         const updatedSubmission = await elevatedUpdateSubmission(item._id, submission);
//         return updatedSubmission;
//     } catch (error) {
//         console.error(error);
//     }
// });
// ============================= DELETE