import wixWindow from 'wix-window';

$w.onReady(function () {
	$w('#boxCartPage').onMouseIn(() => $w('#check').focus)
	$w('#check').onChange(() => checkValidation())
});

function checkValidation(){
	let form = wixWindow.formFactor
	if($w('#check').valid){
		$w('#boxCartPage').collapse();
		if(form == "Mobile") $w('#boxMobile').collapse();
	}else{
		$w('#boxCartPage').expand();
		if(form == "Mobile") $w('#boxMobile').expand();
	}
}