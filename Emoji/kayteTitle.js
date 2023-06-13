$w.onReady(function () {
	$w("#dynamicDataset").onReady(() => {
		let item = $w('#dynamicDataset').getCurrentItem();
		if(item.audio) $w('#audio').expand();
		if(item.phrase) $w('#phrase').expand();
	});
});