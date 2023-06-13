import { session } from 'wix-storage';
import wixData from 'wix-data';

$w.onReady(async function () {
    $w('#dynamicDataset').onReady(async () => {
        let item = $w('#dynamicDataset').getCurrentItem()
        let productInfo = item.title + "-" + item.subtitle
        session.setItem("productInfo", productInfo);

        await wixData.query('Products1').eq('title', item.title).find().then((result) => {
            //console.log(result.items)
            if (result.items.length > 0) {
                let Colors = [];
                result.items.forEach(item2 => {
                    if (!(item2.color == item.color)) Colors.push({ _id: item2._id, image: item2.image, url: item2['link-products-1-title'], color: item2.color, colorId: item2.colorId })
                })
                //console.log(Colors)
                $w('#repColors').data = Colors
                $w('#repColors').onItemReady(($item, itemData) => {
                    $item('#imageColor').src = itemData.image;
                    $item('#imageColor').alt = itemData.color;
                    $item('#imageColor').tooltip = itemData.color;
                    $item('#imageColor').link = itemData.url;
                    $item('#labelColor').text = itemData.color;
                    $item('#idColor').text = itemData.colorId;
                })
                $w('#repColors').show();
            }
        }).catch((err) => console.log(err))
    })
});