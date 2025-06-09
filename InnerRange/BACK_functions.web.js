import { Permissions, webMethod } from "wix-web-module";
import { wixEvents } from "wix-events-backend";
import { mediaManager } from "wix-media-backend";
import { elevate } from "wix-auth";

export const getEventInfo = webMethod(Permissions.Anyone, async (eventId) => {
    try {
        const elevatedGetEvent = elevate(wixEvents.getEvent);
        const getEvent = await elevatedGetEvent(eventId);
        return getEvent;
    } catch (error) { console.error(error); }
});

export const getDownloadUrlFunction = webMethod(Permissions.Anyone, async (fileUrl) => {
    const myFileDownloadUrl = await mediaManager.getDownloadUrl(fileUrl);
    return myFileDownloadUrl;
}, );