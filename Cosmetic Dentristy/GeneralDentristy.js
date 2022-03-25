$w.onReady(function () {
    init();
});

function init() {
    $w("#dynamicDataset").onReady(() => getAll());
}

function getAll() {
    console.log($w('#dynamicDataset').getCurrentItem())
    switch ($w('#dynamicDataset').getCurrentItem().seoUrl) {
    case "amalgam-removal":
        $w('#box2').collapse();
        $w('#box3').collapse();
        $w('#box4').collapse();
        $w('#columnStrip8').collapse();
        $w('#button8').link = $w('#dynamicDataset').getCurrentItem().urlCaseOfStudy
        break;
    case "teeth-straightening":
        $w('#box2').collapse();
        $w('#box3').collapse();
        $w('#box4').collapse();
        $w('#button8').link = $w('#dynamicDataset').getCurrentItem().urlCaseOfStudy
        break;

    case "white-fillings":
        $w('#box2').collapse();
        $w('#box3').collapse();
        $w('#box4').collapse();
        $w('#group2').collapse();
        $w('#columnStrip8').collapse();
        $w('#columnStrip10').collapse();
        break;

    case "emergency-dentistry":
        $w('#group2').collapse();
        break;

    case "inman-aligners":
        $w('#columnStrip9').collapse();
        $w('#columnStrip10').collapse();
        break;

    case "paediatric-dentistry":
        $w('#columnStrip8').collapse();
        $w('#columnStrip9').collapse();
        $w('#columnStrip10').collapse();
        break;
    }

    /*
    let form = $w('#dynamicDataset').getCurrentItem().seoUrl;
    if( form == "bridges" || form == "crowns" || form == "implant-costs" || form == "smile-makeover" || form == "veneers-2"){
    	$w('#form1').expand()
    }
    */
}