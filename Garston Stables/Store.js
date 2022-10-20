import wixData from 'wix-data';

$w.onReady(function () {
    filterProducts();
	init()
});

function init() {
	$w('#tags').onChange(() => filter())
}

function filterProducts() {
    wixData.query("Stores/Collections")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                let filter = []
                for (let i = 0; i < results.items.length; i++) {
                    filter.push({ label: results.items[i].name, value: results.items[i]._id })
                }
                filter.pop();
                $w('#tags').options = filter;
            }
        })
        .catch((err) => {
            console.log(err)
        });
}

function filter() {
	let filter = wixData.filter();
	//Collection filter
    if ($w('#tags').value.length == 0) filter = filter.and(wixData.filter().hasSome("collections", ["00000000-000000-000000-000000000001"]))
    else filter = filter.and(wixData.filter().hasSome("collections", $w('#tags').value))
	$w("#DataProducts").setFilter(filter);
}