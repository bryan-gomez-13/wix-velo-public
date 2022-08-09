import wixSite from 'wix-site';

$w.onReady(function () {
	$w('#page').value = wixSite.currentPage.name;
});