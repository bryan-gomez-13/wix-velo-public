import wixData from 'wix-data';
import wixWindowFrontend from 'wix-window-frontend';
import { getPlan3Courses, getBanner, getBannerValidation, updateBanner } from 'backend/collections.web.js'

var plan3, plan4, id, change = 0,
    size = 0;

const maxTitle = 24;
const maxDescription = 77;

$w.onReady(function () {
    init();
    filterData();

    //if (wixWindowFrontend.formFactor !== "Mobile") getDataPlan4();
    getDataPlan3();
    getBannerValidation().then((results) => { if (results) bannerAbove(); })
});

function init() {
    // Filter
    $w('#dropKey').onInput(() => filterData());
    $w('#dropCategory').onChange(() => filterData());

    // Banner
    $w('#adAboveImage').onClick(() => updateBanner(id))

    // First Courses
    $w('#right').onClick(() => right());
    $w('#left').onClick(() => left());
}

function filterData() {
    const categoryF = $w('#dropCategory').value;
    const keyF = $w('#dropKey').value;
    const dnow = new Date();

    let filter = wixData.filter();

    if (categoryF !== '' && categoryF !== "RESET_ALL") filter = filter.and(wixData.filter().eq("category", categoryF));
    if (keyF !== '') filter = filter.and(wixData.filter().contains("title", keyF));

    filter = filter.and(wixData.filter().eq('active', true));
    filter = filter.and(wixData.filter().ge('dateFinalCourse', dnow));

    $w('#dataCourses').onReady(() => {
        $w('#dataCourses').setFilter(filter).then(() => {
            $w('#dataCourses').onReady(() => {
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
        })
    })
}

// ========================================================================== BANNER ==========================================================================
// function getDataPlan4() {
//     getBanner('lateral').then((results) => {
//         plan4 = results;
//         let sizePlan4 = plan4.length;

//         switch (sizePlan4) {
//         case 0:
//             $w('#slideshow1').collapse();
//             $w('#slideshow4').collapse();
//             break;

//         case 1:
//             $w('#slideshow1').collapse();
//             $w('#slideshow4').expand();
//             $w('#imageOne').src = plan4[0].image;
//             $w('#imageOne').link = plan4[0].link;
//             $w('#imageOne').alt = plan4[0].title;
//             $w('#imageOne').tooltip = plan4[0].title;
//             break;

//         case 2:
//             //banner 1
//             $w('#imageOne').src = plan4[0].image;
//             $w('#imageOne').link = plan4[0].link;
//             $w('#imageOne').alt = plan4[0].title;
//             $w('#imageOne').tooltip = plan4[0].title;
//             $w('#slideshow4').expand();
//             //banner 2
//             $w('#imageTwo').alt = plan4[1].title;
//             $w('#imageTwo').src = plan4[1].image;
//             $w('#imageTwo').link = plan4[1].link;
//             $w('#imageTwo').tooltip = plan4[1].title;
//             $w('#slideshow1').expand();

//             break;
//         }
//     })
// }

// ========================================================================== GET PLAN 3 ==========================================================================
function getDataPlan3() {
    getPlan3Courses().then((results) => {
        plan3 = results;
        size = plan3.length;

        if (size > 2) {
            $w('#sImage0').src = plan3[change].image;
            $w('#sTitle0').text = plan3[change].title;
            $w('#sShortDescription0').text = plan3[change].shortDescription;
            $w('#sButton0').link = plan3[change]['link-allcourses-title'];
            change++
            $w('#sImage1').src = plan3[change].image;
            $w('#sTitle1').text = plan3[change].title;
            $w('#sShortDescription1').text = plan3[change].shortDescription;
            $w('#sButton1').link = plan3[change]['link-allcourses-title'];

            $w('#boxPlan3').expand();
            $w('#left').expand();
            $w('#right').expand();
        } else {
            switch (size) {
            case 0:
                $w('#boxPlan3').collapse();
                $w('#left').collapse();
                $w('#right').collapse();
                break;
            case 1:
                $w('#boxRight').hide();
                $w('#right').hide();
                $w('#left').hide();
                $w('#boxPlan3').expand();
                $w('#sImage0').src = plan3[change].image;
                $w('#sTitle0').text = plan3[change].title;
                $w('#sShortDescription0').text = plan3[change].shortDescription;
                $w('#sButton0').link = plan3[change]['link-allcourses-title'];
                break;
            case 2:
                $w('#right').hide();
                $w('#left').hide();
                $w('#boxPlan3').expand();

                $w('#sImage0').src = plan3[change].image;
                $w('#sTitle0').text = plan3[change].title;
                $w('#sShortDescription0').text = plan3[change].shortDescription;
                $w('#sButton0').link = plan3[change]['link-allcourses-title'];
                change++

                $w('#sImage1').src = plan3[change].image;
                $w('#sTitle1').text = plan3[change].title;
                $w('#sShortDescription1').text = plan3[change].shortDescription;
                $w('#sButton1').link = plan3[change]['link-allcourses-title'];
                break;
            }
        }
        return plan3;
    })
}
// ========================================================================== RIGHT CLICK ==========================================================================
function right() {
    if (change >= size - 1) {
        //$w('#right').hide();
    } else {
        $w('#sImage0').src = plan3[change].image;
        $w('#sTitle0').text = plan3[change].title;
        $w('#sShortDescription0').text = plan3[change].shortDescription;
        $w('#sButton0').link = plan3[change]['link-allcourses-title'];
        change++
        if (change >= size - 1) {
            //$w('#right').hide();
            $w('#sImage1').src = plan3[change].image;
            $w('#sTitle1').text = plan3[change].title;
            $w('#sShortDescription1').text = plan3[change].shortDescription;
            $w('#sButton1').link = plan3[change]['link-allcourses-title'];
        } else {
            $w('#sImage1').src = plan3[change].image;
            $w('#sTitle1').text = plan3[change].title;
            $w('#sShortDescription1').text = plan3[change].shortDescription;
            $w('#sButton1').link = plan3[change]['link-allcourses-title'];
        }
    }
}

// ========================================================================== LEFT CLICK ==========================================================================
function left() {
    change--
    if (change < 1) {
        //$w('#left').hide();
        change = 1;
    } else {
        $w('#sImage1').src = plan3[change].image;
        $w('#sTitle1').text = plan3[change].title;
        $w('#sShortDescription1').text = plan3[change].shortDescription;
        $w('#sButton1').link = plan3[change]['link-allcourses-title'];
        change--
        if (change <= 1) {
            //$w('#left').hide();
            $w('#sImage0').src = plan3[change].image;
            $w('#sTitle0').text = plan3[change].title;
            $w('#sShortDescription0').text = plan3[change].shortDescription;
            $w('#sButton0').link = plan3[change]['link-allcourses-title'];
        } else {
            $w('#sImage0').src = plan3[change].image;
            $w('#sTitle0').text = plan3[change].title;
            $w('#sShortDescription0').text = plan3[change].shortDescription;
            $w('#sButton0').link = plan3[change]['link-allcourses-title'];
        }
    }
    change++;
}

// ========================================================================== BANNER ==========================================================================
function bannerAbove() {
    getBanner("allCourses").then((banner) => {
        console.log("banner", banner)
        if (banner.length > 0) {
            id = banner[0]._id;
            $w('#adAboveImage').src = banner[0].image;
            $w('#adAboveImage').link = banner[0].link;
            $w('#adAboveImage').alt = banner[0].title;
            $w('#adAboveImage').tooltip = banner[0].title;
            $w('#adAboveImageBox').collapse();
            //$w('#adAboveTitle').text = banner[0].title;
        } else {
            $w('#adAboveImageBox').expand();
        }
    })
}