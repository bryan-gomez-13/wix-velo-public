import wixLocationFrontend from "wix-location-frontend";
import * as wixSiteWindow from '@wix/site-window';
import * as wixSiteStorage from '@wix/site-storage';
import { getPasswordItem } from 'backend/collections.web.js';

$w.onReady(function () {
    let path = normalizeUrl(wixLocationFrontend.url);

    getPasswordItem(path).then(async (pageItem) => {
        console.log('pageItem', pageItem)
        if (pageItem.length > 0) {
            const passOk = await wixSiteStorage.session.getItem(path);
            const savePassword = pageItem[0]?.savePassword;

            if (!passOk || !savePassword) {
                wixSiteWindow.window.openLightbox('CustomPass', { item: pageItem[0] }).then((x) => {
                    if (x == null) wixLocationFrontend.to('/')
                    else wixSiteStorage.session.setItem(path, 'ok');
                })
            }
        }
    })
});

// Normalize a URL by removing the trailing slash if present
export function normalizeUrl(url) {
    if (typeof url !== "string") return url; // Safety check

    // Remove trailing slash except when the URL is just "/"
    return (url.endsWith('/') && url.length > 1) ?
        url.slice(0, -1) :
        url;
}