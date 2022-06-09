import wixData from 'wix-data';
var dnow = new Date();
var id;
$w.onReady(function () {
    filterData();
    //bannerAbove();
    $w('#adAboveImage').onClick(() => clicks())
});
// ===================================== BANNER =====================================
function bannerAbove() {
    //AD ABOVE
    let filterPlan4 = wixData.query("Banner");
    filterPlan4.eq('active', true).and(filterPlan4.ge('dateFinal', dnow)).and(filterPlan4.eq('adAbove', true)).find().then(results => {
        let banner = results.items;
        if (banner.length > 0) {
            id = banner[0]._id;
            $w('#adAboveImage').alt = banner[0].title;
            $w('#adAboveImage').src = banner[0].image;
            $w('#adAboveImage').link = banner[0].link;
            $w('#adAboveTitle').text = banner[0].title;
            $w('#adAbove').expand();
        } else {
            $w('#adAbove').collapse();
        }
    });
}

function clicks() {
    wixData.query("Banner")
        .eq('_id', id)
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                let banner = results.items[0]; //see item below
                banner.clicks++
                wixData.update("Banner", banner)
                    .then((results) => {
                        console.log(results)
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });
}
// ===================================== FILTER =====================================
export async function filterData() {
    let filter = wixData.filter();
    let dnow = new Date();
    filter = filter.eq('active', true).and(filter.eq('category', 'Arts and Crafts')).and(filter.ge('dateFinalCourse', dnow));
    await $w('#dataset17').setFilter(filter);
    itemDateRepeater();
}

export function itemDateRepeater() {
    $w('#dataset17').onReady(() => {
        $w("#repeater1").forEachItem(($item, itemData, index) => {
            let repeaterData = $w("#repeater1").data;
            if (repeaterData[index].checkBoxDate == true) {
                $item('#group1').show();
                $item('#group2').hide();
            } else {
                $item('#group2').show();
                $item('#group1').hide();
            }
        });
    })
}

/*

FREE launch promo
3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4 

cheap and cheerful
3bbb3d86-e37d-46e8-b7fe-b2357b08a55c

cheap + more cheerfu
206f9520-8619-468c-90ef-190798511246

feature it
13b985c8-bef6-454e-90bf-7fb562ff6cb3

eye catching banner
d6a54e3d-e9db-4740-8dbe-102825b55ec3

*/