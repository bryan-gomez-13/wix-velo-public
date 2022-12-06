import wixData from 'wix-data';

$w.onReady(function () {

    $w('#filter').onChange(() => {
        let filter = wixData.filter();
        if ($w('#filter').value !== "all") filter = filter.and(wixData.filter().eq("title", $w('#filter').value));
        $w('#dataset1').setFilter(filter);
    })

});