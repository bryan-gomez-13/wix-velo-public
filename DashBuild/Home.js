import wixWindow from 'wix-window';

$w.onReady(function () {
    services();
    init();
});

function init(){
    let formFactor = wixWindow.formFactor;

    if(formFactor == "Desktop"){
        //Location
        $w('#boxLocation').onMouseIn(() => $w('#textLocation').expand());
        $w('#boxLocation').onMouseOut(() => $w('#textLocation').collapse());

        //Consulting
        $w('#boxConsulting').onMouseIn(() => $w('#textConsulting').expand());
        $w('#boxConsulting').onMouseOut(() => $w('#textConsulting').collapse());

        //Design
        $w('#boxDesign').onMouseIn(() => $w('#textDesign').expand());
        $w('#boxDesign').onMouseOut(() => $w('#textDesign').collapse());

        //Build
        $w('#boxBuild').onMouseIn(() => $w('#textBuild').expand());
        $w('#boxBuild').onMouseOut(() => $w('#textBuild').collapse());

        //Manage
        $w('#boxManage').onMouseIn(() => $w('#textManage').expand());
        $w('#boxManage').onMouseOut(() => $w('#textManage').collapse());

        //Decorate
        $w('#boxDecorate').onMouseIn(() => $w('#textDecorate').expand());
        $w('#boxDecorate').onMouseOut(() => $w('#textDecorate').collapse());
    }else{
        //Location
        $w('#ReadMoreL').expand();
        $w('#boxLocation').onClick(() => {$w('#textLocation').expand(), $w('#ReadLessL').expand()});
        $w('#ReadMoreL').onClick(() => {$w('#textLocation').expand(), $w('#ReadLessL').expand(), $w('#ReadMoreL').collapse()});
        $w('#ReadLessL').onClick(() => {$w('#textLocation').collapse(), $w('#ReadLessL').collapse(), $w('#ReadMoreL').expand()});

        //Consulting
        $w('#ReadMoreC').expand();
        $w('#boxConsulting').onClick(() => {$w('#textConsulting').expand(), $w('#ReadLessC').expand()});
        $w('#ReadMoreC').onClick(() => {$w('#textConsulting').expand(), $w('#ReadLessC').expand(), $w('#ReadMoreC').collapse()});
        $w('#ReadLessC').onClick(() => {$w('#textConsulting').collapse(), $w('#ReadLessC').collapse(), $w('#ReadMoreC').expand()});

        //Design
        $w('#ReadMoreDes').expand();
        $w('#boxDesign').onClick(() => {$w('#textDesign').expand(), $w('#ReadLessDes').expand()});
        $w('#ReadMoreDes').onClick(() => {$w('#textDesign').expand(), $w('#ReadLessDes').expand(), $w('#ReadMoreDes').collapse()});
        $w('#ReadLessDes').onClick(() => {$w('#textDesign').collapse(), $w('#ReadLessDes').collapse(), $w('#ReadMoreDes').expand()});

        //Build
        $w('#ReadMoreB').expand();
        $w('#boxBuild').onClick(() => {$w('#textBuild').expand(), $w('#ReadLessB').expand()});
        $w('#ReadMoreB').onClick(() => {$w('#textBuild').expand(), $w('#ReadLessB').expand(), $w('#ReadMoreB').collapse()});
        $w('#ReadLessB').onClick(() => {$w('#textBuild').collapse(), $w('#ReadLessB').collapse(), $w('#ReadMoreB').expand()});

        //Manage
        $w('#ReadMoreM').expand();
        $w('#boxManage').onClick(() => {$w('#textManage').expand(), $w('#ReadLessM').expand()});
        $w('#ReadMoreM').onClick(() => {$w('#textManage').expand(), $w('#ReadLessM').expand(), $w('#ReadMoreM').collapse()});
        $w('#ReadLessM').onClick(() => {$w('#textManage').collapse(), $w('#ReadLessM').collapse(), $w('#ReadMoreM').expand()});

        //Decorate
        $w('#ReadMoreDec').expand();
        $w('#boxDecorate').onClick(() => {$w('#textDecorate').expand(), $w('#ReadLessDec').expand()});
        $w('#ReadMoreDec').onClick(() => {$w('#textDecorate').expand(), $w('#ReadLessDec').expand(), $w('#ReadMoreDec').collapse()});
        $w('#ReadLessDec').onClick(() => {$w('#textDecorate').collapse(), $w('#ReadLessDec').collapse(), $w('#ReadMoreDec').expand()});
    }

}

//Services
async function services() {
    let i = 1;
    let up = {
        //"duration": 1000,
        "direction": 'top'
    };

    let down = {
        //"duration": 1000,
        "direction": 'bottom'
    };

    while (i == 1) {
        $w('#2').hide("slide",down);
        $w('#3').hide("slide",down);
        $w('#1').show("slide", up);
        await delay(2);

        $w('#1').hide("slide",down);
        $w('#3').hide("slide",down);
        $w('#2').show("slide", up);
        await delay(2);

        $w('#2').hide("slide",down);
        $w('#1').hide("slide",down);
        $w('#3').show("slide", up);
        await delay(2);
    }
}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time * 1000);
    });
}