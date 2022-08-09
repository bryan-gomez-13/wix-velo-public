$w.onReady(function () {
    let item = $w('#dynamicDataset').getCurrentItem();

    if (item.gallery) $w('#gallery1').expand()
    else $w('#gallery1').collapse()

    if (item.imageText) $w('#imageText').expand();
    else $w('#imageText').collapse();

    if (item.image) $w('#principalImage').expand();
    else $w('#principalImage').collapse();

});