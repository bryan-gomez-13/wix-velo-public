$w.onReady(function () {
	//console.log($w('#dynamicDataset').hasNextPage())
	if($w('#dynamicDataset').hasNextPage() == false){
		$w('#button4').collapse();
	}
});