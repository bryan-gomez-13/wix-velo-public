import wixWindow from 'wix-window';
$w.onReady(function () {
    let received = wixWindow.lightbox.getContext();
    $w('#sentence').text = received.sentence;
    $w('#boxS').show();
});