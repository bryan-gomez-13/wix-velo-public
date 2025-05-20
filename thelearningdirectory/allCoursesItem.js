$w.onReady(function () {
    const itemObj = $w("#dynamicDataset").getCurrentItem();
    if (itemObj.checkBoxDate == true) {
        $w('#group3').show();
        $w('#group2').hide();
    } else {
        $w('#group2').show();
        $w('#group3').hide();
    }

    if (itemObj.emailClients && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(itemObj.emailClients)) {
        const email = itemObj.emailClients;
        const subject = itemObj.title;

        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;

        $w('#btContact').link = gmailLink;
        $w('#btContact').target = "_blank"; // Abre en nueva pestaña
        $w('#btContact').expand();

    } else {
        $w('#btContact').collapse();
    }
});