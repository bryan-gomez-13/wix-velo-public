import wixWindow from 'wix-window';
import { cancelMyPlan, changeStatus } from "backend/data.jsw"

$w.onReady(function () {
    let received = wixWindow.lightbox.getContext();
    $w('#title').text = "Cancel " + received.planInfo.name + "?";
    $w('#title').show();
    console.log(received)

    $w('#cancel').onClick(async () => {
        await cancelMyPlan(received.order);
		await changeStatus(received)
        wixWindow.lightbox.close({ "message": true });
    })

    $w('#noCancel').onClick(() => {
        wixWindow.lightbox.close({ "message": false });
    })
});