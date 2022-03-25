$w.onReady(function () {
    $w("#enquiry").onClick((event) => {
        let $item = $w.at(event.context);
        let clickedItemData = $item("#dataset1").getCurrentItem();
        //console.log(clickedItemData);
        $w('#wixForms1').scrollTo();
        $w('#input16').value = "";
        $w('#input16').value = clickedItemData.title;
    });
});