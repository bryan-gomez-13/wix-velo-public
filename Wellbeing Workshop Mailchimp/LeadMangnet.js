import wixLocation from 'wix-location';

$w.onReady(function () {
    $w("#html1").onMessage((event) => {
        console.log('here', event.data)
        if (event.data) {
            setTimeout(() => {
                wixLocation.to('https://fd59ab26-3e0b-41ac-bcdc-937a96c5d180.usrfiles.com/ugd/fd59ab_9d5c0d6e787b492b9bcdcc57e5734235.pdf')
            }, 2000);
        }
    });
});