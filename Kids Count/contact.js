import { session } from 'wix-storage';

$w.onReady(function () {
    if (session.getItem("centres")) {
        $w('#centres').value = session.getItem("centres");
        session.clear();
    }
});