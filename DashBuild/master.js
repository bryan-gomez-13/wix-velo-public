import { session } from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
    if(session.getItem('newPage')) session.setItem("oldPage", session.getItem('newPage'));
    else session.setItem("oldPage", "/");
    session.setItem("newPage", wixLocation.url);
});