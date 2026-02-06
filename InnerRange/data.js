import { generalQuery, updateCollection } from 'backend/collections.web.js'

export function Industries_afterUpdate(item, context) {
    if (item.categoryRef) {
        generalQuery('IndustriesCategory', '_id', item.categoryRef).then(async (result) => {
            const queryItem = result[0];
            item.categoryTxT = queryItem.title;
            item.categoryUrl = queryItem.categoryUrl;
            await updateCollection('Industries', item);
        })
    }
}

export function Events1_afterUpdate(item, context) {
    if (item.categoryRef) {
        generalQuery('EventsCategory', '_id', item.categoryRef).then(async (result) => {
            const queryItem = result[0];
            item.categoryTxT = queryItem.title_fld;
            item.categoryUrl = queryItem.categoryUrl;
            await updateCollection('Events1', item);
        })
    }
}