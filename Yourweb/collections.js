import { getDropdownOptions, updateRepaterSearch } from 'backend/collections.web.js';
import wixData from 'wix-data';

let itemsSearch;

$w.onReady(async () => {
    await updateDropdowns();
    init();
});

function init() {
    $w('#search').onInput(() => {
        if ($w('#search').value !== '') {
            updateRepaterSearch($w('#search').value).then((options) => {
                if (options.length > 0) {
                    itemsSearch = options;
                    $w('#repSeach').data = options;
                    $w('#repSeach').forEachItem(($item, itemData) => {
                        $item('#titleAuthor').text = itemData.name;
                    });
                    $w('#repSeach').expand();
                } else $w('#repSeach').collapse();
            })
        } else $w('#repSeach').collapse();
        updateDropdowns();
    });

    $w('#titleAuthor').onClick((event) => {
        const item = itemsSearch.find(search => search._id == event.context.itemId);
        $w('#search').value = item.name;
        $w('#repSeach').collapse();
        filt();
    })

    $w('#mainCategory').onChange(() => updateDropdowns());
    $w('#subCategory').onChange(() => updateDropdowns());
    $w('#tags').onChange(() => updateDropdowns());
    $w('#location').onChange(() => updateDropdowns());
}

async function updateDropdowns() {
    const search = $w('#search').value;
    const mainCategory = ($w('#mainCategory').value == '' || $w('#mainCategory').value == 'All') ? [] : $w('#mainCategory').value;
    const subCategory = ($w('#subCategory').value == '' || $w('#subCategory').value == 'All') ? [] : $w('#subCategory').value;
    const tags = ($w('#tags').value == '' || $w('#tags').value == 'All') ? [] : $w('#tags').value;
    const location = ($w('#location').value == '' || $w('#location').value == 'All') ? [] : $w('#location').value;
    const options = await getDropdownOptions(mainCategory, subCategory, tags, location, search);

    if (Array.isArray(options.mainCategories)) $w('#mainCategory').options = options.mainCategories;
    if (Array.isArray(options.subCategories)) $w('#subCategory').options = options.subCategories;
    if (Array.isArray(options.tagsOptions)) $w('#tags').options = options.tagsOptions;
    if (Array.isArray(options.locations)) $w('#location').options = options.locations;

    filt();
}

function filt() {
    let filter = wixData.filter();
    const search = $w('#search').value;
    const mainCategory = $w('#mainCategory').value;
    const subCategory = $w('#subCategory').value;
    const tags = $w('#tags').value;
    const location = $w('#location').value;

    if (search !== '') filter = filter.and(wixData.filter().contains('title', search).or(wixData.filter().contains('author', search)));
    if (mainCategory !== '' && mainCategory !== 'All') filter = filter.and(wixData.filter().eq('mainCategory', mainCategory));
    if (subCategory !== '' && subCategory !== 'All') filter = filter.and(wixData.filter().eq('subCategory', subCategory));
    if (tags !== '' && tags !== 'All') filter = filter.and(wixData.filter().hasSome('tags', tags));
    if (location !== '' && location !== 'All') filter = filter.and(wixData.filter().eq('location', location));

    $w('#dataset1').setFilter(filter).then(() => {
        $w('#dataset1').onReady(() => {
            $w('#quantity').text = `Total: ${$w('#dataset1').getTotalCount()}`;
            $w('#quantity').expand();
        });
    })
}