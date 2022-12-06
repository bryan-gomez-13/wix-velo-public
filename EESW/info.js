$w.onReady(function () {
    $w('#dynamicDataset').onReady(() => {
        let array = []
        if ($w('#dynamicDataset').getCurrentItem().pdf.length > 0) {
            for (let i = 0; i < $w('#dynamicDataset').getCurrentItem().pdf.length; i++) {
                array.push({ _id: i + "", image: 'https://static.wixstatic.com/media/73f5ce_caf3cf3a10bf46c1ae1bfb62b8811823~mv2.png', document: $w('#dynamicDataset').getCurrentItem().pdf[i] })
            }
            repeater(array)
        }
        if ($w('#dynamicDataset').getCurrentItem().youtubeVideo) {
            $w('#video').src = $w('#dynamicDataset').getCurrentItem().youtubeVideo
            $w('#video').expand()
        }else $w('#video').collapse()

    })

});

function repeater(array) {
    $w('#repPdfs').data = array;
    $w('#repPdfs').forEachItem(($item, itemdata) => {
        $item('#pdf').src = itemdata.image
        $item('#pdf').link = itemdata.document
        $item('#btPdf').link = itemdata.document
    })
    $w('#repPdfs').expand()
}