//import { memory } from 'wix-storage';
import wixData from 'wix-data';
import wixLocation from 'wix-location';

$w.onReady(function () {
    //if (!(memory.getItem("key"))) {
    //    memory.setItem("key", "ok");
    wixData.query('Ad').find().then((results) => {
        if (results.items.length > 0) {
            let item = results.items[0]
            if (item.visible) {
                $w('#ad').src = item.image
                $w('#ad').tooltip = item.link
                $w('#ad').alt = item.link
                $w('#ad').link = item.link
                $w('#ad').show();
            } else $w('#ad').hide();
        }
    })
    //}

	$w('#Counter').onClick(() => {
		$w('#Counter').disable();
        wixData.query('Counter').eq('_id', '92da6b62-b8ae-418c-a17d-b21e09f7b0e4').find().then((results) => {
			let item = results.items[0]
			item.Counter++
			wixData.update('Counter', item).then(() => wixLocation.to('https://www.optionsgroup.com.au/vacancies/'))
        })
    })
});