import { session } from "wix-storage-frontend";

$w.onReady(function () {

    $w('#dynamicDataset').onReady(() => {
        const item = $w('#dynamicDataset').getCurrentItem();
        session.setItem("category", item.category);
    })

});