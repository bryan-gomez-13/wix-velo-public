import wixLocationFrontend from 'wix-location-frontend';
var baseURL = wixLocationFrontend.baseUrl;

$w.onReady(function () {
    $w('#dynamicDataset').onReady(() => {
        $w('#repCareers').onItemReady(($item, itemData, index) => {
            $item('#show').onClick(() => {
                $item('#boxSH').expand();
                $item('#show').collapse();
                $item('#hide').expand();
            });
            $item('#hide').onClick(() => {
                $item('#boxSH').collapse();
                $item('#hide').collapse();
                $item('#show').expand();
            });

            $item('#facebook').onClick(() => wixLocationFrontend.to("https://www.facebook.com/sharer/sharer.php?u="+baseURL+itemData['link-jobs-daikin-1-title']));
            $item('#linkedin').onClick(() => wixLocationFrontend.to("https://www.linkedin.com/sharing/share-offsite/?url="+baseURL+itemData['link-jobs-daikin-1-title']));
            $item('#twitter').onClick(() => wixLocationFrontend.to("https://twitter.com/intent/tweet?text="+baseURL+itemData['link-jobs-daikin-1-title']));
            $item('#email').onClick(() => wixLocationFrontend.to("https://www.addtoany.com/add_to/email?linkurl="+baseURL+itemData['link-jobs-daikin-1-title']));

        })
    })
});