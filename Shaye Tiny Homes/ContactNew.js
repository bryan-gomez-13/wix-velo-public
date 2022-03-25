$w.onReady(function () {
    $w('#contact').onChange(() => contactChange());
});

function contactChange() {
    switch ($w('#contact').value) {
    case 'Build In New Zealand':
		$w('#Box').changeState('Build');
        break;

    case 'Regarding DIY Plans':
		$w('#Box').changeState('Regarding')
        break;

    case 'International Enquiry':
		$w('#Box').changeState('International')
        break;
    }
}