// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixWindow from 'wix-window';

$w.onReady(function () {
    $w('#checkbox1').onChange(() => checkValidation())
    $w('#checkbox2').onChange(() => checkValidation())
    $w('#boxCheckout').onMouseIn(() => checkValidation())
});

function checkValidation() {
    let check1 = $w('#checkbox1');
    let check2 = $w('#checkbox2');
    let formFactor = wixWindow.formFactor;
    if (check1.checked == true && check2.checked == true) {
        $w('#boxCheckout').collapse();
        if (formFactor !== 'Desktop') {
            $w('#mobileBox1').collapse();
        }
    } else {
        $w('#boxCheckout').expand();
		if (check2.checked == false) $w('#checkbox2').focus();
        if (check1.checked == false) $w('#checkbox1').focus();

        if (formFactor !== 'Desktop') {
            $w('#mobileBox1').expand();
        }
    }
}