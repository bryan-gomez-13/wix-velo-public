import { updateDocument } from 'backend/Midoc/collections.web.js'

$w.onReady(function () {

    init();

});

function init() {
    // Refresh
    $w('#btRefresh').onClick(() => {
        $w('#readDocuments').refresh().then(() => {
            $w('#readDocuments').onReady(() => {
                refreshRepeater();
            })
        })
    });

    // Save Documents
    $w('#writeDocument').onAfterSave((event) => {
        updateDocument(event._id).then(() => {
            $w('#readDocuments').refresh();
        });

        $w('#btUpload').reset();
        $w('#expirationTime').value = '';

        $w('#btUpload').resetValidityIndication();
        $w('#expirationTime').resetValidityIndication();
    })

    $w('#readDocuments').onReady(() => {
        refreshRepeater();
    })
}

function refreshRepeater() {
    // Documents
    $w('#repDocuments').onItemReady(($item, itemData) => {
        const date = new Date();
        const expirationDate = new Date(itemData.expirationDate);

        const diffInMs = expirationDate - date; // Difference in milliseconds
        const diffInMinutes = Math.floor(diffInMs / 60000); // Convert to minutes

        $item('#txtExpirationTime').text = `${diffInMinutes}`;
    })
}