import wixWindowFrontend from 'wix-window-frontend';
var size = 500;
$w.onReady(function () {
    $w('#dataTestimony').onReady(() => {
        $w('#repTestimony').onItemReady(($item, itemData) => {
            if (itemData.testimony.length > size) {
                $item('#testimony').text = `${itemData.testimony.substr(0, size)}...`;
                $item('#readMore').expand();
            } else {
                $item('#testimony').text = itemData.testimony;
                $item('#readMore').collapse();
            }

            $item('#readMore').onClick(() => wixWindowFrontend.openLightbox("Testimony", itemData))
        })
    })
});