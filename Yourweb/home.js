var vision = 0;
var fadeOptions = {
    "duration": 1000,
    "direction": 'right'
};
$w.onReady(function () {
    $w('#imageX15').onViewportLeave(() => leave1());
    $w('#section2').onViewportLeave(() => leave2());
    $w('#imageX15').onViewportEnter(() => enter1());
    $w('#section2').onViewportEnter(() => enter2());
});

export function enter1() {
    $w('#auditButton').hide("fly", fadeOptions);
    $w('#requestButton').hide("fly", fadeOptions);
    $w('#whatsAppButton').hide("fly", fadeOptions);
}

export function leave1() {
    $w('#auditButton').show("fly", fadeOptions);
    $w('#requestButton').show("fly", fadeOptions);
    $w('#whatsAppButton').show("fly", fadeOptions);
}

export function enter2() {
    vision = 1;
    $w('#auditButton').hide("fly", fadeOptions);
    $w('#requestButton').hide("fly", fadeOptions);
    $w('#whatsAppButton').hide("fly", fadeOptions);
}

export function leave2() {
    if (vision == 1) {
        vision = 0;
        $w('#auditButton').show("fly", fadeOptions);
        $w('#requestButton').show("fly", fadeOptions);
        $w('#whatsAppButton').show("fly", fadeOptions);
    }
}