/***************
 backend/data.js
 ***************
 Syntax for functions:

 export function [collection name]_[action](item, context){}

***************/
import { getWixDataInfo, getAllWixDataInfo } from 'backend/collections.web.js'
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true }

// ================================================== Menu
// Menu 1
export async function Menu2_afterUpdate(item, context) {
    if (item.menu) {
        await getWixDataInfo("Menu", "_id", item.menu).then(async (menuInfo) => {
            item.menuName = menuInfo.title;
            await wixData.update("Menu2", item, wixDataOptions)
        })
    }
}

// Menu 2
export async function Menu3_afterUpdate(item, context) {
    if (item.menu2) {
        await getWixDataInfo("Menu2", "_id", item.menu2).then(async (menuInfo) => {
            item.menuName = menuInfo.title;
            await wixData.update("Menu3", item, wixDataOptions)
        })
    }
}

// Menu 3
export async function Menu4_afterUpdate(item, context) {
    if (item.menu3) {
        await getWixDataInfo("Menu3", "_id", item.menu3).then(async (menuInfo) => {
            item.menuName = menuInfo.title;
            await wixData.update("Menu4", item, wixDataOptions)
        })
    }
}

// URL Faq
export async function FAQ1_afterUpdate(item, context) {
    if (item.category) {
        await getWixDataInfo("FAQCategories", "_id", item.category).then(async (categoryInfo) => {
            item.categoryName = categoryInfo.title;
            item.categoryUrl = categoryInfo.urlForFaq;
            await wixData.update("FAQ1", item, wixDataOptions)
        })
    }
}

// URL Jobs
export async function JobsDaikin_afterUpdate(item, context) {
    if (item.categoryRef) {
        await getWixDataInfo("JobCategory", "_id", item.categoryRef).then(async (categoryInfo) => {
            item.category = categoryInfo.title;
            item.categoryUrl = categoryInfo.urlDinamicPage;
        })
    }

    if (item.title) {
        if (!item.url) {
            const url = toSlug(item.title);
            item.url = url
        }
        item.seoTitle = item.title;
    }
    if (item.shortDescription) {
        const cleanString = item.shortDescription.replace(/<[^>]*>/g, "").trim();
        item.seoDescription = cleanString;
    }

    await wixData.update("JobsDaikin", item, wixDataOptions)
}

function toSlug(text) {
    return text
        .toLowerCase() // convert to lowercase
        .normalize("NFD") // normalize accents (ñ, á, é...)
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .trim() // remove spaces at start/end
        .replace(/\s+/g, "-") // replace spaces with -
        .replace(/-+/g, "-"); // collapse multiple dashes
}

// URL case studies
export async function CaseStudies_afterUpdate(item, context) {
    if (item.categoryReference) {
        await getWixDataInfo("CSCategory", "_id", item.categoryReference).then(async (categoryInfo) => {
            item.category = categoryInfo.title;
            item.categoryUrl = categoryInfo.urlDinamicPage;
            await wixData.update("CaseStudies", item, wixDataOptions)
        })
    }
}

// Tecnology Panel
export async function TechnologyPanel_afterUpdate(item, context) {
    if (item.product) {
        await getWixDataInfo("Ourproductrange", "_id", item.product).then(async (categoryInfo) => {
            item.productName = categoryInfo.title;
            await wixData.update("TechnologyPanel", item, wixDataOptions)
        })
    }
}

// PTA - Tecnology Panel
export async function PTATechnologyPanel_afterUpdate(item, context) {
    if (item.product) {
        await getWixDataInfo("PerfectingtheAir", "_id", item.product).then(async (categoryInfo) => {
            item.productName = categoryInfo.title;
            await wixData.update("PTATechnologyPanel", item, wixDataOptions)
        })
    }
}

// Category
export async function Category_afterUpdate(item, context) {
    if (item.title && item.url) {
        await getAllWixDataInfo("Menu2", "title", item.title).then(async (categoryInfo) => {
            const menu2Items = await wixData.query("Menu2").eq("menu", "1586da26-fc3c-4d6a-9a96-94b992beb37e").find();
            if (categoryInfo.items.length == 0) {
                const json = {
                    title: item.title,
                    menu: "1586da26-fc3c-4d6a-9a96-94b992beb37e",
                    menuName: "Products",
                    link: item.url,
                    visible: false,
                    order: menu2Items.totalCount + 1
                }
                await wixData.insert("Menu2", json, wixDataOptions)
            }
        })
    }
}

// Sub category
export async function SubCategory_afterUpdate(item, context) {
    if (item.category) {
        await getWixDataInfo("Category", "_id", item.category).then(async (categoryInfo) => {
            if (item.categoryName !== categoryInfo.title) {
                item.categoryName = categoryInfo.title;
                await wixData.update("SubCategory", item, wixDataOptions);
            }

            if (item.title && item.url) {
                await getAllWixDataInfo("Menu3", "title", item.title).then(async (categoryInfo2) => {
                    if (categoryInfo2.totalCount == 0) {
                        const menu1Item = await wixData.query("Menu2").eq("title", categoryInfo.title).find();
                        const menu2Items = await wixData.query("Menu3").eq("menu2", menu1Item.items[0]._id).find();
                        const json = {
                            title: item.title,
                            menu2: menu1Item.items[0]._id,
                            menuName: menu1Item.items[0].title,
                            link: item.url,
                            visible: false,
                            order: menu2Items.totalCount + 1
                        }
                        await wixData.insert("Menu3", json, wixDataOptions)
                    }
                })
            }
        })
    }
}

// URL Projects
export async function Ourproductrange_afterUpdate(item, context) {
    let itemUpdate = false;
    if (item.categoryRef) {
        await getWixDataInfo("Category", "_id", item.categoryRef).then(async (categoryInfo) => {
            //if (item.category !== categoryInfo.title) {
            item.category = categoryInfo.title;
            item.categoryUrl = categoryInfo.urlDinamicPage;
            item.seoCategoryTitle = categoryInfo.seoCategoryTitle;
            item.seoCategoryDescription = categoryInfo.seoCategoryDescription;
            itemUpdate = true;
            //}
        })
    }

    if (item.subCategoryRef) {
        itemUpdate = true;
        await getWixDataInfo("SubCategory", "_id", item.subCategoryRef).then(async (categoryInfo) => {
            //if (item.category !== categoryInfo.title) {
            item.subCategory = categoryInfo.title;
            item.subCategoryUrl = categoryInfo.urlDinamicPage;
            item.seoSubCategoryTitle = categoryInfo.seoSubcategoryTitle;
            item.seoSubCategoryDescription = categoryInfo.seoSubcategoryDescription;
            itemUpdate = true;
            //}

            if (item.title && item.productUrl && item["link-our-product-range-1-title"]) {
                await getAllWixDataInfo("Menu4", "title", item.title).then(async (categoryInfo2) => {
                    if (categoryInfo2.totalCount == 0) {
                        const menu3Item = await wixData.query("Menu3").eq("title", categoryInfo.title).find();
                        const menu4Items = await wixData.query("Menu4").eq("menu3", menu3Item.items[0]._id).find();
                        const json = {
                            title: item.title,
                            menu3: menu3Item.items[0]._id,
                            menuName: menu3Item.items[0].title,
                            link: item["link-our-product-range-1-title"],
                            visible: false,
                            order: menu4Items.totalCount + 1
                        }
                        await wixData.insert("Menu4", json, wixDataOptions)
                    }
                })
            }
        })
    }

    if (itemUpdate) await wixData.update("Ourproductrange", item, wixDataOptions)
}