import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';
import { getBannerValidation, updateBanner, getBanner, generalQuery } from 'backend/collections.web.js'

var id;
const maxTitle = 24;
const maxDescription = 77;

const urls = [
    { url: "arts-and-crafts", field: "artsAndCrafts" },
    { url: "health-and-wellbeing", field: "healthAndWellbeing" },
    { url: "youth-programmes", field: "youthProgrammes" }
]

$w.onReady(async function () {
    filterData();
    init();
});

function init() {
    // Banner
    $w('#adAboveImage').onClick(() => updateBanner(id));
}

async function filterData() {
    const url = wixLocationFrontend.url.split("/");

    generalQuery("Categories", "categoryUrl", url[(url.length - 1)]).then((results) => {
        $w('#categoryTitle').text = results.name;
        $w('#categorySubtitle').text = results.subtitle;
        $w('#categoryDescription').html = results.description;
    })

    const category = url[(url.length - 1)];

    const dnow = new Date();

    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("categoryUrl", category));
    filter = filter.and(wixData.filter().eq('active', true));
    filter = filter.and(wixData.filter().ge('dateFinalCourse', dnow));

    // $w('#dynamicDataset').onReady(() => {
    $w('#dynamicDataset').setFilter(filter).then(() => {
        $w('#dynamicDataset').onReady(() => {
            console.log($w('#dynamicDataset').getTotalCount())
            if ($w('#dynamicDataset').getTotalCount() == 0) $w('#messageNotCourses').expand();
            else $w('#messageNotCourses').collapse();

            if ($w('#repCourses').hidden) $w('#repCourses').show();
            $w("#repCourses").onItemReady(($item, itemData, index) => {
                $item('#title').text = (itemData.title.length > maxTitle) ? itemData.title.slice(0, maxTitle) + "..." : itemData.title;
                $item('#description').text = (itemData.shortDescription.length > maxDescription) ? itemData.shortDescription.slice(0, maxDescription) + "..." : itemData.shortDescription;
                if (itemData.checkBoxDate == true) {
                    $item('#boxCalendar').expand();
                    $item('#boxAppointment').collapse();
                } else {
                    $item('#boxCalendar').collapse();
                    $item('#boxAppointment').expand();
                }
            });
        })
        // })
    })

    getBannerValidation().then(async (results) => {
        if (results) bannerAbove(category);
    })
}

function bannerAbove(url) {
    const item = urls.find((item) => item.url == url);
    if (item) {
        getBanner(item.field).then((banner) => {
            if (banner.length > 0) {
                id = banner[0]._id;
                $w('#adAboveImage').src = banner[0].image;
                $w('#adAboveImage').link = banner[0].link;
                $w('#adAboveImage').alt = banner[0].title;
                $w('#adAboveImage').tooltip = banner[0].title;
                $w('#adAbove').expand();
            } else {
                $w('#adAbove').collapse();
            }
        })
    }
}