$w.onReady(function () {
	var itemObj = $w("#dynamicDataset").getCurrentItem();
	if(itemObj.checkBoxDate == true){
		$w('#group3').show();
		$w('#group2').hide();
	}else{
		$w('#group2').show();
		$w('#group3').hide();
	}
});