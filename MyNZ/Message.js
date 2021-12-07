import wixWindow from 'wix-window';

$w.onReady(function () {
	let email = wixWindow.lightbox.getContext().email;
	$w('#text124').text = "¡Success! Your member signup request has been sent and is awaiting approval. The site administrator will notify you via email "+email+" once your request has been approved."
});