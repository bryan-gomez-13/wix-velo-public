import { Permissions, webMethod } from "wix-web-module";
import { mediaManager } from "wix-media-backend";

export const getFileInfo = webMethod(Permissions.Anyone, async (fileUrl) => {
    return mediaManager.getFileInfo(fileUrl);
});

export const getDownloadUrl = webMethod(Permissions.Anyone, async (fileUrl, expirationTime) => {
    const downloadedFileName = await getFileInfo(fileUrl);
    const urlDownload = await mediaManager.getDownloadUrl(fileUrl, expirationTime, downloadedFileName.originalFileName, "https://www.google.com/");
    return { title: downloadedFileName.originalFileName, urlDownload: urlDownload };
}, );