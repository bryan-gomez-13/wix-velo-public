import wixData from 'wix-data';

$w.onReady(function () {
    $w('#dropCity').onChange(() => filter())
	Cities();
});

// ================================================== FILTER ==================================================
function filter() {
    let filter = wixData.filter();
    if ($w('#dropCity').value !== 'All') {
        filter = filter.and((wixData.filter().eq("cities", $w('#dropCity').value)));
    }
    $w('#dataset1').setFilter(filter);
}
// ================================================== DROPDOWN ==================================================
async function Cities() {
    await wixData.query("Cities")
        .ascending("cityName")
        .find()
        .then((results) => {
            let options = [{ "label": "All", "value": "All" }];
            for (let i = 0; i < results.items.length; i++) {
                options.push({ label: results.items[i].nameCity, value: results.items[i]._id })
			}
            $w('#dropCity').options = options;
        })
}