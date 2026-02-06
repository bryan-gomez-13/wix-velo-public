import * as wixSiteWindow from '@wix/site-window';

let password;

$w.onReady(async function () {

    $w('#pass').label = "Password";
    $w('#pass').placeholder = "Password";

    const context = (await wixSiteWindow.lightbox.getContext()).item;
    $w('#msgTitle').text = context.titleMessage;
    $w('#msgDescription').text = context.descriptionMessage;
    password = context.password;

    init();
});

function init() {
    $w('#pass').onKeyPress((x) => { if (x.key == 'Enter') checkPassword(); })
    $w('#btPass').onClick(() => { checkPassword(); })
}

function checkPassword() {
    const inPassword = $w('#pass').value;
    if (password == inPassword) {
        wixSiteWindow.lightbox.close({ ok: true })
    } else {
        $w('#btPass').style.borderColor = '#FF0000';
        $w('#txtPass').show();
    }
}