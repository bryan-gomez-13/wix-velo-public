import { Permissions, webMethod } from "wix-web-module";
import wixData from 'wix-data';

const wixDataOptions = { suppressAuth: true, suppressHooks: true }

// ============================================================= CREATE
export const saveContactUs = webMethod(Permissions.Anyone, async (json, document) => {
    if (document !== "") json.document = document;
    return await wixData.insert("ContactUs", json, wixDataOptions).catch((err) => console.log(err))
});
// ============================================================= READ
export const getContacts = webMethod(Permissions.Anyone, async () => {
    return await wixData.query("MembersForContactUs").eq("activos", true).find().then((result) => { return result.items.map((email) => email.privateId) })
});

export const updateRepaterSearch = webMethod(Permissions.Anyone, async (search) => {
    const result = await wixData.query("Collection").contains("title", search).or(wixData.query("Collection").contains("author", search)).limit(1000).find();

    const processed = result.items.map(item => {
        const matchTitle = item.title?.toLowerCase().includes(search.toLowerCase());
        const matchAuthor = item.author?.toLowerCase().includes(search.toLowerCase());

        let name = "";

        if (matchTitle) {
            name = item.title;
        } else if (matchAuthor) {
            name = item.author;
        }

        return {
            _id: item._id,
            name
        };
    });

    // Ordenar alfabéticamente y limitar a los primeros 5
    const sorted = processed
        .filter(item => item.name) // Asegura que haya un nombre válido
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 5);

    return sorted;
});

export const getDropdownOptions = webMethod(Permissions.Anyone, async (mainCategory, subCategory, tags, location, search) => {
    let filter = wixData.query("Collection");

    const isArrayOrAll = (value) => Array.isArray(value) || value === "All" || !value;

    if (!isArrayOrAll(mainCategory)) {
        filter = filter.and(wixData.query("Collection").eq("mainCategory", mainCategory));
    }

    if (!isArrayOrAll(subCategory)) {
        filter = filter.and(wixData.query("Collection").eq("subCategory", subCategory));
    }

    if (!isArrayOrAll(tags)) {
        filter = filter.and(wixData.query("Collection").hasSome("tags", [tags]));
    }

    if (!isArrayOrAll(location)) {
        filter = filter.and(wixData.query("Collection").eq("location", location));
    }

    if (search !== '') {
        filter = filter.and(wixData.query("Collection").include("title", search).or(wixData.query('Collection').include('author', search)));
    }

    let results = await filter.limit(1000).find();
    let items = results.items;
    while (results.hasNext()) {
        results = await results.next();
        items = items.concat(results.items);
    }

    // Helpers
    function createDropdownWithCount(itemsArray) {
        const counts = {};
        itemsArray.forEach(item => {
            if (item) {
                counts[item] = (counts[item] || 0) + 1;
            }
        });

        const uniqueSorted = Object.keys(counts).sort();
        const dropdown = uniqueSorted.map(value => ({
            label: `${value} (${counts[value]})`,
            value
        }));

        dropdown.unshift({ label: "All", value: "All" });
        return dropdown;
    }

    function createDropdownSimple(itemsArray, isArrayField = false) {
        let allValues = [];

        itemsArray.forEach(item => {
            if (isArrayField && Array.isArray(item)) {
                allValues = allValues.concat(item);
            } else if (!isArrayField && item) {
                allValues.push(item);
            }
        });

        const uniqueSorted = [...new Set(allValues)].sort();
        const dropdown = uniqueSorted.map(value => ({ label: value, value }));
        dropdown.unshift({ label: "All", value: "All" });
        return dropdown;
    }

    return {
        mainCategories: isArrayOrAll(mainCategory) ? createDropdownWithCount(items.map(i => i.mainCategory)) : false,
        subCategories: isArrayOrAll(subCategory) ? createDropdownWithCount(items.map(i => i.subCategory)) : false,
        tagsOptions: isArrayOrAll(tags) ? createDropdownSimple(items.map(i => i.tags), true) : false,
        locations: isArrayOrAll(location) ? createDropdownSimple(items.map(i => i.location)) : false
    };
});

// ============================================================= UPDATE
// ============================================================= DELETE