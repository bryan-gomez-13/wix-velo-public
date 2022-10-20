import wixData from 'wix-data';

let size = 250;

$w.onReady(function () {
    loadCitys();

    $w("#dataset1").setFilter(wixData.filter()
            .eq("jobSector", "Administration/Office Support")
            .contains("city", $w("#dropdownCity").value))
        .then(() => {
            repeater1_itemReady();
            if ($w("#dataset1").getTotalCount() === 0) {
                $w("#noResultsMessage").show();
                $w("#loadMore").hide();
            } else {
                $w("#dropdownCity").show();
            }
        })

    $w("#dropdownCity").onChange(() => {
        $w("#dataset1").setFilter(wixData.filter()
            .eq("jobSector", "Administration/Office Support")
            .contains("city", $w("#dropdownCity").value))
        repeater1_itemReady();
    })

    $w("#repeater1").onItemReady(($item, itemData, index) => {
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

});

function loadCitys() {

    wixData.query("JobsTable")
        .eq("jobSector", "Administration/Office Support")
        .ascending("city")
        .distinct("city")
        .then((results) => {
            let citysOptions = [];
            citysOptions = results.items.map((cityJobs) => { return { label: cityJobs, value: cityJobs } });
            $w('#dropdownCity').options = citysOptions;
        })
        .catch((err) => {
            let errMSG = err;
        })
}

export function repeater1_itemReady() {

    $w('#repeater1').onItemReady(($job, job) => {
        if (job.shortDescription.length > size) {
            $job('#shortDescription').text = `${job.shortDescription.substr(0,size)}...`;
        } else {
            $job('#shortDescription').text = job.shortDescription;
        }
    })
}