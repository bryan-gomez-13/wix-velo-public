$w.onReady(function () {
    $w('#dynamicDataset').onReady(() => {
        let item = $w('#dynamicDataset').getCurrentItem();
        $w('#videoPlayer1').src = item.video
    })
});