import wixLocation from 'wix-location';

var fadeOptions = {
    "duration": 500
};

var x = 0;

$w.onReady(function () {
    //Menu
    $w('#open').onClick(() => openM())
    $w('#button7').onClick(() => closeM())
    //Options
    $w('#notes').onClick(() => open())
    $w('#close').onClick(() => close())
    //Image
    $w('#vectorImage6').onClick(() => changeImage())
    $w('#vectorImage7').onClick(() => changeImage())
    $w('#vectorImage6').onClick(() => changeImage())
    $w('#vectorImage6').onClick(() => changeImage())

});

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

function open() {
    $w("#box95").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box96").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box98").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box99").style.backgroundColor = "rgba(0,0,0,0.5)"

    $w("#box100").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box102").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box104").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box106").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box108").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box110").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box112").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box114").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box116").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box118").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box120").style.backgroundColor = "rgba(0,0,0,0.5)"
    $w("#box122").style.backgroundColor = "rgba(0,0,0,0.5)"

    $w('#BOX').show("fade", fadeOptions);
    $w('#box1').hide("fade", fadeOptions);
    //$w('#close').show("fade", fadeOptions);
}

function close() {
    let isVisible = $w("#BOX").isVisible;
    if (isVisible) {
        $w('#BOX').hide("fade", fadeOptions);
        $w('#box1').show("fade", fadeOptions);
        //$w('#close').hide("fade", fadeOptions);
    } else {
        //wixLocation.to('/projects')
        wixLocation.to('https://dashwekebuild.editorx.io/dashbuildx/projects')
    }
}

function changeImage() {
    if (x == 0) x = 1
    else if (!($w('#BOX').isVisible)) {
        $w("#box95").style.backgroundColor = "rgba(0,0,0,0)";
        $w("#box96").style.backgroundColor = "rgba(0,0,0,0)";
        $w("#box99").style.backgroundColor = "rgba(0,0,0,0)";
        $w("#box98").style.backgroundColor = "rgba(0,0,0,0)";

        $w("#box100").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box102").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box104").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box106").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box108").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box110").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box112").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box114").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box116").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box118").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box120").style.backgroundColor = "rgba(0,0,0,0)"
        $w("#box122").style.backgroundColor = "rgba(0,0,0,0)"
    }
}