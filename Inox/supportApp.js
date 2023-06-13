import wixData from 'wix-data';

$w.onReady(function () {
    getFAQ("b16ebc15-ad49-414e-be22-4dc25bdd70fe")
    $w('#box25').onClick(() => getFAQ("b16ebc15-ad49-414e-be22-4dc25bdd70fe"))
    $w('#box26').onClick(() => getFAQ("c3bc3668-dbe6-4e63-85d0-c38d5e0b9fb0"))
    $w('#box27').onClick(() => getFAQ("c19e29c4-5acf-4a1c-9a18-470b1cc99e20"))
});

function getFAQ(lvl2) {
    //$w('#multi').collapse()
    wixData.query('Level3').eq('level2', lvl2).ascending('order').find().then((results) => {
        //console.log(results.items)
        $w('#faqRepLvL2').data = results.items
        $w('#faqRepLvL2').forEachItem(($item, itemData, index) => {
            if (index == 0) {
				$w('#multi').changeState(itemData.idMultiStep)
				$item('#item').disable()
			}
            $item('#item').label = itemData.title
            $item('#item').onClick(() => {
                $w('#multi').changeState(itemData.idMultiStep)
                $w("#faqRepLvL2").forEachItem(($item2, itemData2, index2) => {
                    if (index2 == index) $item2('#item').disable()
                    else $item2('#item').enable()
                });
            })
        })
        $w('#faqRepLvL2').show();
    }).catch((err) => console.log(err))
}