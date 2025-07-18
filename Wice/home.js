import { getHomeRepeater } from 'backend/collections.web.js';

$w.onReady(function () {

    getHomeRepeater().then((directoryInfo) => {
        $w('#repDirectory').data = directoryInfo;
        $w('#repDirectory').onItemReady(($item, itemData) => {
            $item('#charge').text = itemData.charge;
            $item('#image').src = itemData.image;
            $item('#title').text = itemData.title;
            $item('#onelineHeadline').text = itemData.onelineHeadline;
            $item('#linkedin').link = itemData.linkedin;
            $item('#moreInfo').link = itemData['link-members-directory-title-2'];
        })
        $w('#repDirectory').expand();
    })

});