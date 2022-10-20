import wixData from 'wix-data';

$w.onReady(function () {
    loadSector();
    $w("#dropdownSector").onChange(() => {
        $w("#dataset1").setFilter(wixData.filter()
            .eq("city", "Auckland")
            .contains("jobSector", $w("#dropdownSector").value))
    })
});

function loadSector() {
    wixData.query("JobsTable")
        .eq("city", "Auckland")
        .ascending("jobSector")
        .distinct("jobSector")
        .then((results) => {
            let optionsSector = [];
            optionsSector = results.items.map((sector) => { return { label: sector, value: sector } });
            optionsSector.shift();
            $w("#dropdownSector").options = optionsSector;
        })
        .catch((err) => {
            let errMSG = err;
        })
}