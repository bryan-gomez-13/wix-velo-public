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

    generalQuery('IndustriesCategory', 'categoryLink', newUrl)
    .then((result) => {
        const item = result[0];
        if (!item) return;

        // ==============================
        // CATEGORY DATASET (MAIN)
        // ==============================
        $w('#dataCategory')
            .setFilter(wixData.filter().eq('_id', item._id))
            .then(() => loadCategorySections(item));


        // ==============================
        // DATASET 3 → FILTER BY pages
        // ==============================
        applyDatasetFilter('#dataset3', 'pages', item.pages, '#sec3');


        // ==============================
        // DATASET 5 → FILTER BY solutions
        // ==============================
        applyDatasetFilter('#dataset5', 'solutions', item.pages, [
            '#sec11',
            '#secHistory'
        ]);


        // ==============================
        // DATASET 2 → FILTER BY pages
        // ==============================
        applyDatasetFilter('#dataset2', 'pages', item.pages, '#sec14');


        // ==============================
        // DATASET 4 → FILTER BY pages (Assumed)
        // ==============================
        applyDatasetFilter('#dataset4', 'pages', item.pages, '#sec16');


        // ==============================
        // DYNAMIC DATASET → FILTER BY categoryUrl
        // ==============================
        $w('#dynamicDataset')
            .setFilter(
                wixData.filter()
                    .eq('categoryUrl', item.categoryUrl)
                    .and(wixData.filter().not(wixData.filter().eq('title_fld', 'Do not delete this item')))
            )
            .then(() => {
                $w('#dynamicDataset').onReady(() => {
                    const totalDynamic = $w('#dynamicDataset').getTotalCount();
                    if (totalDynamic > 0) {
                        $w('#sec15').expand();
                        $w('#secItems').expand();
                    } else {
                        $w('#secItems').collapse();
                    }
                });
            });

    });
}


// =====================================
// REUSABLE FUNCTION TO FILTER DATASETS
// =====================================
function applyDatasetFilter(datasetId, field, value, sectionToToggle) {
    // Apply filter based on field and value
    $w(datasetId).setFilter(
        wixData.filter().hasSome(field, value)
    ).then(() => {

        $w(datasetId).onReady(() => {
            const total = $w(datasetId).getTotalCount();

            // Toggle multiple or single sections
            if (Array.isArray(sectionToToggle)) {
                sectionToToggle.forEach(sec =>
                    total > 0 ? $w(sec).expand() : $w(sec).collapse()
                );
            } else {
                total > 0 ? $w(sectionToToggle).expand() : $w(sectionToToggle).collapse();
            }
        });
    });
}


// =====================================
// LOAD ALL CONTENT SECTIONS
// =====================================
function loadCategorySections(itemData) {

    if (!itemData) return;

    // Load full sections
    loadSection('#sec1', itemData?.section1Title, '#section1Title',
        itemData?.section1Description, '#section1Description',
        itemData?.section1Video, '#section1Video');

    loadSection('#sec2', itemData?.section2Title, '#section2Title',
        itemData?.section2Description, '#section2Description',
        itemData?.section2Image, '#section2Image');

    loadSection('#sec4', itemData?.section4Title, '#section4Title',
        itemData?.section4Description, '#section4Description',
        itemData?.section4Image, '#section4Image');

    loadSection('#sec5', itemData?.section5Title, '#section5Title',
        itemData?.section5Description, '#section5Description',
        itemData?.section5Image, '#section5Image');

    loadSection('#sec6', itemData?.section6Title, '#section6Title',
        itemData?.section6Description, '#section6Description',
        itemData?.section6Image, '#section6Image');

    loadSection('#sec7', itemData?.section7Title, '#section7Title',
        itemData?.section7Description, '#section7Description',
        itemData?.section7Image, '#section7Image');

    loadSection('#sec8', itemData?.section8Title, '#section8Title',
        itemData?.section8Description, '#section8Description',
        itemData?.section8Image, '#section8Image');

    loadSection('#sec9', itemData?.section9Title, '#section9Title',
        itemData?.section9Description, '#section9Description',
        itemData?.section9Image, '#section9Image');

    // Special sections
    safeToggle('#sec10', !!itemData?.section10Image);

    if (itemData?.section12Gallery) {
        $w('#sec11').expand();
        $w('#sec12').expand();
    } else {
        $w('#sec12').collapse();
    }
}


// =====================================
// SECTION BUILDER
// =====================================
function loadSection(sectionBox, titleValue, titleElement, descValue, descElement, mediaValue, mediaElement) {

    // Check if there is content
    const hasContent = titleValue || descValue || mediaValue;

    if (!hasContent) {
        safeToggle(sectionBox, false);
        return;
    }

    // Toggle each visible element
    safeToggle(titleElement, !!titleValue);
    safeToggle(descElement, !!descValue);
    safeToggle(mediaElement, !!mediaValue);

    safeToggle(sectionBox, true);
}


// =====================================
// SAFE EXPAND/COLLAPSE
// =====================================
function safeToggle(id, show) {
    try {
        if (!$w(id)) return;
        show ? $w(id).expand() : $w(id).collapse();
    } catch (err) {
        console.warn(`safeToggle: Element ${id} failed.`);
    }
}