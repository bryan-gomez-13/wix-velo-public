import wixData from 'wix-data';
var wixDataOptions = { suppressAuth: true, suppressHooks: true }

export async function AllCourses_afterInsert(item, context) {
    if (item.category) {
        await wixData.query("Categories").eq("name", item.category).find().then(async (category) => {
            const categoryInfo = category.items[0];
            item.categoryRef = categoryInfo._id;
            item.categoryUrl = categoryInfo.categoryUrl;
            await wixData.update("AllCourses", item, wixDataOptions)
        })
    }
}

export async function AllCourses_afterUpdate(item, context) {
    if (item.category || item.categoryRef) {
        const field = (item.categoryRef) ? "_id" : "name";
        const value = (item.categoryRef) ? item.categoryRef : item.category;

        await wixData.query("Categories").eq(field, value).find().then(async (category) => {
            const categoryInfo = category.items[0];
            item.categoryRef = categoryInfo._id;
            item.category = categoryInfo.name;
            item.categoryUrl = categoryInfo.categoryUrl;
            await wixData.update("AllCourses", item, wixDataOptions)
        })
    }
}