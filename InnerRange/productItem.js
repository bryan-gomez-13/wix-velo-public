import { session } from 'wix-storage-frontend';
import { relatedProducts } from 'backend/collections.web.js'
import wixLocationFrontend from 'wix-location-frontend';
import wixData from 'wix-data';

var ok = true,
    page = "";
$w.onReady(function () {
    let menuBox = []
    if (session.getItem("page")) {
        page = session.getItem("page").replace(wixLocationFrontend.baseUrl, "");
        $w('#button13').link = page;
        $w('#button14').link = page;
        session.removeItem("page");
    } else $w('#button13').link = "/products", $w('#button14').link = "/products";

    $w('#dynamicDataset').onReady(() => {
        let item = $w('#dynamicDataset').getCurrentItem();

        if (item.ok) wixLocationFrontend.to(page)

        if (item.features) $w('#rich').show(), menuBox.push({ _id: "0", label: "Features", box: "features" });

        relatedProducts(item._id).then((products) => {
            if (products.length > 0) {
                let filter = wixData.filter();
                filter = filter.and(wixData.filter().hasSome("_id", products));
                $w('#dateRelatedProducts').setFilter(filter).then(() => {
                    $w('#dateRelatedProducts').onReady(() => {
                        if ($w('#dateRelatedProducts').getTotalCount() > 0) menuBox.push({ _id: "1", label: "Related products", box: "relatedProducts" });
                        $w('#repRelatedProducts').expand();
                        boxMenuF(menuBox);
                    })
                })
            } else $w('#repRelatedProducts').collapse();
        })

        if (item.orderingOptions) menuBox.push({ _id: "2", label: "Ordering Options", box: "orderingOptions" });

        if (item.videosUrlMedia) {
            menuBox.push({ _id: "5", label: "Media", box: "media" });
            let media = item.videosUrlMedia.split(',');
            //let gallery = media.map(video => ({ "type": "video", "src": video.trim() }));
            let gallery2 = media.map(video => ({ "type": "video", "src": video.trim(), _id: generateRandomId(5) }));
            //$w('#gallery1').items = gallery;

            $w('#repVideos').data = gallery2;
            //console.log(gallery2)
            $w('#repVideos').onItemReady(($item, itemData) => {
                $item('#videoPlayer1').src = itemData.src
            })

        } else $w('#videoPlayer1').collapse();

        if (item.video) $w('#video').expand();
        else $w('#video').collapse();

        boxMenuF(menuBox);

        $w('#dataDocument').onReady(() => {
            //console.log($w('#dataDocument').getTotalCount())
            if ($w('#dataDocument').getTotalCount() > 0) menuBox.push({ _id: "3", label: "Documents", box: "documents" });
            boxMenuF(menuBox);
            $w('#repDocument').onItemReady(($item, itemData, index) => {
                let fileName = itemData.fileName.replace(/ /g, '-')
                let url = itemData.document + '?dn=' + fileName;
                $item('#documentDownload').link = url;
            })
        })

        $w('#dataSoftware').onReady(() => {
            if ($w('#dataSoftware').getTotalCount() > 0) menuBox.push({ _id: "4", label: "Software & Firmware", box: "softwareFirmware" });
            boxMenuF(menuBox);
            $w('#repSoftware').onItemReady(($item, itemData, index) => {
                let fileName = itemData.fileName.replace(/ /g, '-')
                let url = itemData.document + '?dn=' + fileName;
                $item('#softwareDownload').link = url;
            })
        })
    })
});

function boxMenuF(menuBox) {
    menuBox.sort((a, b) => a._id - b._id);
    $w('#repMenu').data = menuBox;
    $w('#repMenu').onItemReady(($item, itemData) => {
        if (ok) {
            $item('#btMenu').disable();
            ok = false;
            $w('#boxMenu').changeState(itemData.box);
        }
        $item('#btMenu').label = itemData.label;
        $item('#btMenu').onClick(() => {
            $w('#boxMenu').changeState(itemData.box);
            $w('#repMenu').onItemReady(($item2, itemData2) => {
                if (itemData2._id !== itemData._id) $item2('#btMenu').enable();
            })
            $item('#btMenu').disable();
        })
    })
}

function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}