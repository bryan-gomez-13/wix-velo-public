$w.onReady(function () {
   
});


export function repeater2_itemReady($item2, itemData2, index2) {
	 $w("#repeater2").forEachItem(($item, itemData, index) => {
        if (itemData.aditionalinfo !== true) {
            $item("#button9").hide();
  
        }else{
            $item('#textDefault').text = itemData.defaultText;
            $item('#textDefault').show();
            $item('#text373').hide();
            $item('#text374').hide();
            $item('#text375').hide();
            $item('#text376').hide();
            $item('#text377').hide();
            $item("#text378").hide();
            $item("#text379").hide();
            $item("#text380").hide();
        }
    });
}