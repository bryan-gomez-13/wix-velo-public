import { local } from 'wix-storage';
import * as wixSiteWindow from '@wix/site-window';

$w.onReady(function () {
    let item = (wixSiteWindow.window.formFactor == 'Mobile') ? '#mobileQuote' : '#quantityQuote'
    const checkOut = local.getItem('checkOut') ? JSON.parse(local.getItem('checkOut')) : [];
    const totalQuantity = checkOut.reduce((sum, item) => {
        return sum + (item.quantity || 0);
    }, 0);
    $w(item).text = `${totalQuantity}`;
});