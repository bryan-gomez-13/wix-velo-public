var fadeOptions = {
    "duration": 500
};

$w.onReady(function () {
    //Menu
    $w('#open').onClick(() => openM())
    $w('#button7').onClick(() => closeM())

    //ABout Us
    $w('#bDashCompany').onClick(() => openAbout())
    $w('#cross').onClick(() => closeAbout())

    //Our Process
    $w('#locationbox').onClick(() => ourProcess('locationbox'));
    $w('#consulting').onClick(() => ourProcess('consulting'));
    $w('#designbox').onClick(() => ourProcess('designbox'));
    $w('#buildbox').onClick(() => ourProcess('buildbox'));
    $w('#managebox').onClick(() => ourProcess('managebox'));
    $w('#decoratebox').onClick(() => ourProcess('decoratebox'));
    $w('#crossbutton').onClick(() => ourProcess('crossbutton'));
});

//========================================== MENU ==========================================
function openM() {
    $w('#1').show("fade", fadeOptions);
    $w('#2').show("fade", fadeOptions);
    $w('#3').show("fade", fadeOptions);
    $w('#4').show("fade", fadeOptions);
    $w('#5').show("fade", fadeOptions);
    $w('#6').show("fade", fadeOptions);
    $w('#button7').show("fade", fadeOptions);
    $w('#logo').show("fade", fadeOptions);
    $w('#open').hide("fade", fadeOptions);
}

function closeM() {
    $w('#1').hide("fade", fadeOptions);
    $w('#2').hide("fade", fadeOptions);
    $w('#3').hide("fade", fadeOptions);
    $w('#4').hide("fade", fadeOptions);
    $w('#5').hide("fade", fadeOptions);
    $w('#6').hide("fade", fadeOptions);
    $w('#button7').hide("fade", fadeOptions);
    $w('#logo').hide("fade", fadeOptions);
    $w('#open').show("fade", fadeOptions);
}

//========================================== ABOUT ==========================================
function openAbout() {
    $w('#aboutbox').hide("fade", fadeOptions);
    $w('#companyvalues').show("fade", fadeOptions);
    $w('#cross').show("fade", fadeOptions);
}

function closeAbout() {
    $w('#companyvalues').hide("fade", fadeOptions);
    $w('#cross').hide("fade", fadeOptions);
    $w('#aboutbox').show("fade", fadeOptions);
}

//========================================== OUR PROCESS ==========================================
//BASE          wix:image://v1/b0568f_8160011ce1c940c897011bec87e290c0~mv2.jpg/_.jpg#originWidth=1000&originHeight=667
//LOCATION      wix:image://v1/b0568f_15f883cf6fee4a54b650a870f31a498b~mv2.jpg/_.jpg#originWidth=1500&originHeight=1001
//CONSULTING    
//DESIGN        wix:image://v1/b0568f_0323d22c88b042b9a5394e50e76990bc~mv2.jpg/_.jpg#originWidth=1000&originHeight=667
//BUILD         wix:image://v1/b0568f_946bb71cdccf4de0ab37f8ebbbc301e7~mv2.png/_.png#originWidth=1000&originHeight=541
//MANAGE        wix:image://v1/b0568f_749e779c18d34be895099efadd4c3904~mv2.jpg/1.jpg#originWidth=1000&originHeight=667
//DECORATE      wix:image://v1/b0568f_7c4ef52637184c548443e587ad61d737~mv2.png/_.png#originWidth=1000&originHeight=541

function ourProcess(process) {
    switch (process) {
    case 'crossbutton':
        $w('#base').src = 'wix:image://v1/b0568f_8160011ce1c940c897011bec87e290c0~mv2.jpg/_.jpg#originWidth=1000&originHeight=667';
        $w('#LOCATIONBOX').hide("fade", fadeOptions);
        $w('#CONSULTINGBOX').hide("fade", fadeOptions);
        $w('#DESIGNBOX').hide("fade", fadeOptions);
        $w('#BUILDBOX').hide("fade", fadeOptions);
        $w('#MANAGEBOX').hide("fade", fadeOptions);
        $w('#DECORATE').hide("fade", fadeOptions);
        $w('#crossbutton').hide("fade", fadeOptions);
        $w('#Ourorocess').show("fade", fadeOptions);
        $w('#box88').show("fade", fadeOptions);
        break;
    case 'locationbox':
        $w('#base').src = 'wix:image://v1/b0568f_15f883cf6fee4a54b650a870f31a498b~mv2.jpg/_.jpg#originWidth=1500&originHeight=1001';
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#LOCATIONBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
        //´PENDIENTE
    case 'consulting':
        $w('#base').src = 'wix:image://v1/b0568f_8160011ce1c940c897011bec87e290c0~mv2.jpg/_.jpg#originWidth=1000&originHeight=667';
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#CONSULTINGBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'designbox':
        $w('#base').src = 'wix:image://v1/b0568f_0323d22c88b042b9a5394e50e76990bc~mv2.jpg/_.jpg#originWidth=1000&originHeight=667';
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#DESIGNBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'buildbox':
        $w('#base').src = 'wix:image://v1/b0568f_946bb71cdccf4de0ab37f8ebbbc301e7~mv2.png/_.png#originWidth=1000&originHeight=541';
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#BUILDBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'managebox':
        $w('#base').src = 'wix:image://v1/b0568f_749e779c18d34be895099efadd4c3904~mv2.jpg/1.jpg#originWidth=1000&originHeight=667';
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#MANAGEBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'decoratebox':
        $w('#base').src = 'wix:image://v1/b0568f_7c4ef52637184c548443e587ad61d737~mv2.png/_.png#originWidth=1000&originHeight=541';
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#DECORATE').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    }
}