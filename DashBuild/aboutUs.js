import wixWindow from 'wix-window';
import wixData from 'wix-data';

var fadeOptions = {
    "duration": 500
};

var BASE, CONSTRUCT, CONSULTING, DECORATE, DESIGN, MANAGE, LOCATION;

$w.onReady(async function () {
    if (wixWindow.formFactor !== 'Desktop') disableButtons();

    await urlImages();

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
    $w('#box92').show("fade", fadeOptions);
    $w('#box104').show("fade", fadeOptions);
    $w('#button7').show("fade", fadeOptions);
    $w('#logo').show("fade", fadeOptions);
    $w('#open').hide("fade", fadeOptions);
}

function closeM() {
    $w('#box92').hide("fade", fadeOptions);
    $w('#box104').hide("fade", fadeOptions);
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
//LOCATION      https://static.wixstatic.com/media/b0568f_51babd5107e045be8925af6222bd72ba~mv2.jpg
//CONSULTING    https://static.wixstatic.com/media/b0568f_265e5cb86abc43b68bb2ea8107deacbb~mv2.jpg
//DESIGN        https://static.wixstatic.com/media/b0568f_79a2ca23cae34ab9bd2da72ee29ebffb~mv2.jpg
//CONSTRUCT     https://static.wixstatic.com/media/b0568f_4241186a5b0745cca5ee9c9e18dee3a8~mv2.jpg
//MANAGE        https://static.wixstatic.com/media/b0568f_7fc64ac16b914bb0abc24c4aab31dbd8~mv2.jpg
//DECORATE      https://static.wixstatic.com/media/b0568f_56aac123e854474bbc84f18a00c2f407~mv2.jpg

function ourProcess(process) {
    switch (process) {
    case 'crossbutton':
        $w('#base').src = BASE;
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
        $w('#base').src = LOCATION;
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#LOCATIONBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
        //´PENDIENTE
    case 'consulting':
        $w('#base').src = CONSULTING;
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#CONSULTINGBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'designbox':
        $w('#base').src = DESIGN;
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#DESIGNBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'buildbox':
        $w('#base').src = CONSTRUCT;
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#BUILDBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'managebox':
        $w('#base').src = MANAGE;
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#MANAGEBOX').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    case 'decoratebox':
        $w('#base').src = DECORATE;
        $w('#Ourorocess').hide("fade", fadeOptions);
        $w('#box88').hide("fade", fadeOptions);
        $w('#DECORATE').show("fade", fadeOptions);
        $w('#crossbutton').show("fade", fadeOptions);
        break;
    }
}

function disableButtons() {
    //$w('#bProject').enable()
    //$w('#bAboutUs').disable()
    //$w('#bCareers').enable()
    //$w('#bContact').enable()
}

function urlImages() {
    wixData.query("OurProcess")
        .find()
        .then((results) => {
            for (let i = 0; i < results.items.length; i++) {
                if (results.items[i].title == "BASE") BASE = results.items[i].url
                else if (results.items[i].title == "CONSTRUCT") CONSTRUCT = results.items[i].url
                else if (results.items[i].title == "CONSULTING") CONSULTING = results.items[i].url
                else if (results.items[i].title == "DECORATE") DECORATE = results.items[i].url
                else if (results.items[i].title == "DESIGN") DESIGN = results.items[i].url
                else if (results.items[i].title == "LOCATION") LOCATION = results.items[i].url
                else if (results.items[i].title == "MANAGE") MANAGE = results.items[i].url
            }
        })
        .catch((err) => {
            console.log(err);
        });
}s