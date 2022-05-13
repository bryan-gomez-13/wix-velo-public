import wixWindow from 'wix-window';
$w.onReady(function () {
    let formFactor = wixWindow.formFactor;
    $w("#repeater2").onItemReady(($item, itemData, index) => {
        //console.log(itemData)
        if (formFactor !== "Desktop") {
            $item('#box47').expand();
        } else {
            $item('#image15').onMouseIn(() => {
                $item('#box47').expand();
                //console.log(itemData.depth)
                //console.log(itemData)
            });
            $item('#box47').onMouseOut(() => {
                $item('#box47').collapse();
            });
        }

        if (itemData.depth == undefined) {
            $item("#depth").hide();
            $item('#text396').hide();
        }

        if (itemData.aditionalinfo !== true) {
            $item("#button12").hide();
            $item('#G').show();
        } else {
            $item("#button12").show();
            $item('#textDefault').text = itemData.defaultText;
            $item('#G').hide()
            $item('#textDefault').show();
        }
    });
});