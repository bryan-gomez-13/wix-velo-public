var fadeOptions = {
    "duration": 500
};

$w.onReady(function () {
    $w('#open').onClick(() => open())
    $w('#button7').onClick(() => close())
});

function open() {
    $w('#1').show("fade", fadeOptions);
    $w('#2').show("fade", fadeOptions);
    $w('#3').show("fade", fadeOptions);
    $w('#4').show("fade", fadeOptions);
    $w('#5').show("fade", fadeOptions);
    $w('#6').show("fade", fadeOptions);
    $w('#button7').show("fade", fadeOptions);
    //$w('#logo').show("fade", fadeOptions);
    $w('#open').hide("fade", fadeOptions);
}

function close() {
    $w('#1').hide("fade", fadeOptions);
    $w('#2').hide("fade", fadeOptions);
    $w('#3').hide("fade", fadeOptions);
    $w('#4').hide("fade", fadeOptions);
    $w('#5').hide("fade", fadeOptions);
    $w('#6').hide("fade", fadeOptions);
    $w('#button7').hide("fade", fadeOptions);
    //$w('#logo').hide("fade", fadeOptions);
    $w('#open').show("fade", fadeOptions);
}