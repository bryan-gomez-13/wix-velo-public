import { lightbox } from 'wix-window-frontend';

$w.onReady(function () {
    let info = lightbox.getContext();
    console.log(info)
    $w('#name').text = info.title;
    $w('#testimony').text = info.testimony;
	$w('#info').show();
});