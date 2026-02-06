import wixLocationFrontend from 'wix-location-frontend';
import { generalQuery } from 'backend/collections.web.js'
import wixData from "wix-data";

$w.onReady(function () {
    // const newUrl = wixLocationFrontend.url.replace(baseURL, '');
    // Get the full URL
    const fullUrl = wixLocationFrontend.url;

    // Create a URL object to parse it
    const urlObj = new URL(fullUrl);

    // Extract only the pathname (without query parameters)
    const cleanPath = urlObj.pathname;

    applyFilterByCategory(cleanPath);
});

// =====================================
// APPLY FILTER BY CATEGORY
// =====================================
function applyFilterByCategory(newUrl) {

    generalQuery('EventsCategory', 'categoryLink', newUrl)
        .then((result) => {
            const item = result[0];
            if (!item) return;

            // ==============================
            // CATEGORY DATASET (MAIN)
            // ==============================
            $w('#dataCategory').setFilter(wixData.filter().eq('_id', item._id))

            // ==============================
            // DYNAMIC DATASET → FILTER BY categoryUrl
            // ==============================
            $w('#dynamicDataset').setFilter(wixData.filter().eq('categoryUrl', item.categoryUrl).and(wixData.filter().not(wixData.filter().eq('title_fld', 'Do not delete this item')))).then(() => {
                $w('#dynamicDataset').onReady(() => {
                    const totalDynamic = $w('#dynamicDataset').getTotalCount();
                    if (totalDynamic > 0) {
                        $w('#secEvents').expand();
                    } else {
                        $w('#secEvents').collapse();
                    }
                });
            });

        });
}