$w.onReady(function () {
    init();

});

function init() {
    $w("#dynamicDataset").onReady(() => getStudyCases());
	$w('#button8').link = $w('#dynamicDataset').getCurrentItem().urlCasosDeEstudio
}

function getStudyCases() {
    console.log($w('#dynamicDataset').getCurrentItem())
    switch ($w('#dynamicDataset').getCurrentItem().numeroDeCasosDeEstudio) {
    case 1:
        $w('#box2').collapse();
        $w('#box3').collapse();
        break;
    case 2:
        $w('#box3').collapse();
        break;
    }

	let form = $w('#dynamicDataset').getCurrentItem().seoUrl;
	if( form == "bridges" || form == "crowns" || form == "implant-costs" || form == "smile-makeover" || form == "veneers-2"){
		$w('#form1').expand()
	}
    if( form == "cerec-2" ){
        $w('#columnStrip8').collapse();
        $w('#columnStrip10').collapse();
    }
    if( form == "smile-makeover" ){
        $w('#columnStrip8').collapse();
    }
}