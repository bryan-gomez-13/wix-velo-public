import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(async function () {

    let item = await $w('#dynamicDataset').getCurrentItem()
    productInox(item)

    $w('#repeater2').onItemReady(($item, itemData) => {
        $item('#image').onClick(() => {
                if (itemData.videoCheck) {
                    if ($w('#section8').collapsed) $w('#video').src = itemData.video, $w('#section8').expand();
                    else $w('#section8').collapse();
                }else $w('#section8').collapse()
            })

            $item('#text6').onClick(() => {
                if (!(itemData.videoCheck)) $w('#section8').collapse(), wixLocation.to(itemData.document)
                else {
                    if ($w('#section8').collapsed) $w('#video').src = itemData.video, $w('#section8').expand();
                    else $w('#section8').collapse();
                }
            })

        $w('#repeater2').forEachItem(($item2, itemData2) => {
            if (itemData2.videoCheck) $item2('#download').hide();
            else $item2('#download').show(), $item2('#image').link = itemData2.document;
        })
    })

});

async function productInox(product) {
    if (!(product.title)) product = $w('#dynamicDataset').getCurrentItem();
    $w('#supportTxt').html = '<h2><span style="font-family:wfont_cc189c_a0ba53fc71dc4437b6dc3c63b1754c54,wf_a0ba53fc71dc4437b6dc3c63b,orig_outfit_regular">' + product.title + '</span> Plate Support</h2>';
    wixData.query('SupportProduct').eq('product', product._id).find().then(async (results) => {
        if (results.items.length > 0) {
            await filterSupport(product._id);
            $w('#section12').expand();
        }
    }).catch((err) => console.log(err))
}

function filterSupport(product) {
    let filter = wixData.filter();
    filter = filter.and(wixData.filter().eq("product", product));
    $w('#dataset1').setFilter(filter);
}