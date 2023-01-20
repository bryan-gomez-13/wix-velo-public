// YOURWEB
import wixData from 'wix-data';
$w.onReady(function () {
    init()
    getTags()
})

function init() {
    $w('#expertiseTag').onChange(() => filter())
    $w('#applicationTag').onChange(() => filter())
}

async function getTags() {
    await wixData.query("Expertise").ascending('title').find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i]._id })
            }
            $w('#expertiseTag').options = array;
        }).catch((err) => console.log(err))

    await wixData.query("Application").ascending('title').find()
        .then((results) => {
            let array = [];
            for (let i = 0; i < results.items.length; i++) {
                array.push({ label: results.items[i].title, value: results.items[i]._id })
            }
            $w('#applicationTag').options = array;
        }).catch((err) => console.log(err))
}

function filter() {
    let filter = wixData.filter();
    if ($w('#applicationTag').value.length > 0) filter = filter.and(wixData.filter().hasSome("application", $w('#applicationTag').value));
    if ($w('#expertiseTag').value.length > 0) filter = filter.and(wixData.filter().hasSome("expertise", $w('#expertiseTag').value));
    $w('#teamDataset').setFilter(filter);
}