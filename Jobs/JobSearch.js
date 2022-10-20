import wixData from "wix-data";
import { session } from 'wix-storage';
import { loadCities, loadSectors } from 'backend/backend.jsw';

// Filter Variables
let onTime;
let lastFilterKeyWords = session.getItem("keyword");
let lastFilterSector = session.getItem("nameSector");
let lastFilterCity = session.getItem("nameCity");

$w.onReady(() => {

    $w('#recruitmentDataSet').onReady(() => {
        filter(lastFilterKeyWords, lastFilterSector, lastFilterCity);
        lastFilterCity = undefined;
        lastFilterKeyWords = undefined;
        lastFilterSector = undefined;
    });

    $w("#repeaterJobs").onItemReady(($item, itemData, index) => {
        //$item("#readMore").link = `${itemData["link-jobs-table-title"]}`;
        if (itemData.jobType) $item('#jobType').expand()
        else $item('#jobType').collapse()

        if (itemData.bulletPoints) $item('#bulletPoint').expand()
        else $item('#bulletPoint').collapse()

        if (itemData.externalId) {
            if (itemData.externalId.includes('https')) {
                $item('#readMore').link = itemData.externalId;
            } else {
                wixData.query("RecruitmentCompanies")
                    .eq('title', itemData.recruitmentCompany)
                    .find()
                    .then((results) => {
                        if (results.items.length > 0) {
                            if (results.items[0].jobUrl) $item('#readMore').link = results.items[0].jobUrl + itemData.externalId
                            else $item('#readMore').collapse()
                        } else {
                            $item('#readMore').collapse()
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }

            $item("#readMore").target = "_blank";
            $item('#readMore').expand()
        } else $item('#readMore').collapse()

    });

    if (lastFilterCity === "All Cities") {
        lastFilterCity = undefined;
    }
    if (lastFilterSector === "All Sector") {
        lastFilterSector = undefined;
    }
});

loadCities()
    .then((results) => {
        $w('#searchCity').options = results;
    });

loadSectors()
    .then((results) => {
        $w('#searchSector').options = results;
    });

// Filter Function 
function filter(keywords, jobSector, city) {

    let newFilter = wixData.filter();

    if (keywords) {
        newFilter = newFilter.contains('title', keywords)
            .or(newFilter.contains('recruitmentCompany', keywords)
                .or(newFilter.contains('shortDescription', keywords)));
    }
    if (jobSector) {
        newFilter = newFilter.contains('jobSector', jobSector);
    }
    if (city) {
        newFilter = newFilter.contains('city', city);
    }

    $w('#jobsDataSet').setFilter(newFilter)
        .then(() => {

            $w("#repeaterJobs").show();
            $w("#loadMore").show();

            if ($w('#jobsDataSet').getTotalCount() === 0) {

                $w("#noResultsMessage").show();
                $w("#loadMore").hide();
            } else {
                $w('#noResultsMessage').hide();
            }
        })
        .catch((err) => {
            console.log(err);
        });

    lastFilterKeyWords = keywords;
    lastFilterSector = jobSector;
    lastFilterCity = city;

}

export function searchKeyword_keyPress(event) {

    if (onTime) {
        clearTimeout(onTime)
        onTime = undefined;
    }
    onTime = setTimeout(() => {
        filter($w('#searchKeyword').value, lastFilterSector, lastFilterCity);
    }, 500)

}

export function searchSector_change(event) {

    if ($w('#searchSector').value === "All Sector") {
        $w('#searchSector').value = undefined
    }

    filter(lastFilterKeyWords, $w('#searchSector').value, lastFilterCity);

}

export function searchCity_change(event) {

    if ($w('#searchCity').value === "All Cities") {
        $w('#searchCity').value = undefined
    }

    filter(lastFilterKeyWords, lastFilterSector, $w('#searchCity').value);

}

export function SearchButton_click(event) {
    //Filter sector
    filter(lastFilterKeyWords, $w('#searchSector').value, lastFilterCity);
    //For city selector
    filter(lastFilterKeyWords, lastFilterSector, $w('#searchCity').value);
    session.clear();
}