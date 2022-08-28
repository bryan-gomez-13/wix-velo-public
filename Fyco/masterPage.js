import { session } from 'wix-storage';
import wixLocation from 'wix-location';
import wixSite from 'wix-site';

$w.onReady(function () {
    init()
});

function init() {
    $w('#delete').onClick(() => $w('#search').value = "")
    $w('#bSearch').onClick(() => {
        session.setItem("query", $w('#search').value)
        if (wixSite.currentPage.name !== 'CATALOGO DE PRODUCTOS (All)') {
            wixLocation.to('/catalogo-de-productos')
        }
    })
	
    $w('#search').onKeyPress((event) => {
        if (event.key == 'Enter') {
            session.setItem("query", $w('#search').value)
            if (wixSite.currentPage.name !== 'CATALOGO DE PRODUCTOS (All)') {
                wixLocation.to('/catalogo-de-productos')
            }
        }
    })
}