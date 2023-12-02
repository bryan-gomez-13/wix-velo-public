import wixData from 'wix-data';
var types = [];
$w.onReady(function () {
    init();
    getOptions();
});

function init() {
    $w('#type').onChange(() => filter());
    $w('#search').onInput(() => filter());
}

async function getOptions() {
    await wixData.query('TypeofProgrammers').ascending('title').find().then((results) => {
        let array = []
        let items = results.items
        for (let i = 0; i < items.length; i++) {
            array.push({ label: items[i].title, value: items[i]._id })
        }
        $w('#type').options = array;
        $w('#type').show();
    }).catch((err) => console.log(err))
}

function filter() {
    let filter = wixData.filter();
    if ($w('#search').value.length > 0) filter = filter.and(wixData.filter().contains("title", $w('#search').value).or(wixData.filter().contains("shortDescription", $w('#search').value)).or(wixData.filter().contains("longDescription", $w('#search').value)));
    if ($w('#type').value.length > 0) filter = filter.and(wixData.filter().hasSome("type", $w('#type').value));
    $w('#dynamicDataset').setFilter(filter);
}