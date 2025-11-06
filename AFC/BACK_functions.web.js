import { webMethod, Permissions } from "wix-web-module";
import { contacts } from "wix-crm-backend";
import { files, folders } from "wix-media.v2";
import { elevate } from "wix-auth";
import { mediaManager } from 'wix-media-backend';
import { Buffer } from 'buffer';

export const getContactInfo = webMethod(Permissions.Anyone, (_id) => {
    const options = { suppressAuth: true, };

    return contacts.getContact(_id, options)
        .then((contact) => { return contact; })
        .catch((error) => { console.error(error); });
});

export const documentsString = webMethod(Permissions.Anyone, async (documentsArray) => {
    // Map each documentInfo to a promise that resolves with "name + url"
    const results = await Promise.all(
        documentsArray.map(async (documentInfo) => {
            const urlDocument = await getFileInfo2(documentInfo.url);
            return `${documentInfo.name}\n${urlDocument}\n\n`;
        })
    );

    // Join all results into a single string
    const string = results.join('');

    return string;

});

export const convertToBoldUnicode = webMethod(Permissions.Anyone, async (text) => {
    let boldText = '';
    for (let char of text) {
        const code = char.charCodeAt(0);

        // Uppercase A-Z
        if (code >= 65 && code <= 90) {
            boldText += String.fromCodePoint(code - 65 + 0x1D400);
        }
        // Lowercase a-z
        else if (code >= 97 && code <= 122) {
            boldText += String.fromCodePoint(code - 97 + 0x1D41A);
        }
        // Numbers 0-9
        else if (code >= 48 && code <= 57) {
            boldText += String.fromCodePoint(code - 48 + 0x1D7CE);
        }
        // Keep other characters as is
        else {
            boldText += char;
        }
    }
    return boldText;
})

export const getEmail = webMethod(Permissions.Anyone, async (json) => {
    try {
        const queryResults = await contacts.queryContacts().eq('primaryInfo.email', json.responsibleEmailSignature).find({ suppressAuth: true });
        if (queryResults.items.length > 0) {
            return queryResults.items[0]._id
        } else {
            const contactInfo = {
                name: { first: json.responsibleNameDeclaration },
                emails: [{ email: json.responsibleEmailSignature, primary: true }]
            };
            const options = { allowDuplicates: false, suppressAuth: true, };

            return contacts.createContact(contactInfo, options)
                .then((contact) => { return contact._id; })
                .catch((error) => { console.error(error); });
        }
    } catch (error) { console.error(error); }
});

export const getFileInfo = webMethod(Permissions.Anyone, async (fileUri) => {
    try {
        if (!fileUri) return null;

        // Solo procesamos si empieza con wix:image:// o wix:document://
        if (fileUri.startsWith('wix:image://') || fileUri.startsWith('wix:document://')) {
            const url = await mediaManager.getFileUrl(fileUri);
            // console.log(url)
            return url;
        }

        // Si ya es una URL válida (por ejemplo, https://), la retornamos directa
        if (fileUri.startsWith('http')) {
            return fileUri;
        }

        // Fallback
        return null;
    } catch (error) {
        console.error('Error in getFileInfo:', error);
        return null;
    }
})

export const getFileInfo2 = webMethod(Permissions.Anyone, async (fileUrl) => {
    if (fileUrl.startsWith('http')) {
        return fileUrl;
    }

    const item = await mediaManager.getFileInfo(fileUrl);
    console.log(fileUrl, item)
    const url = `https://static.wixstatic.com/media/${item.fileName}`;
    return url

});

export const getFileInfo2OLD = webMethod(Permissions.Anyone, async (fileId) => {
    try {
        const descriptor = await files.getFileDescriptor(fileId);
        return descriptor.url;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
})

export const uploadBase64Image = webMethod(Permissions.Anyone, async (base64String, fileName) => {
    try {
        const options = {
            metadataOptions: {
                isPrivate: false,
                isVisitorUpload: true
            }
        }
        // Elimina el prefijo "data:image/png;base64,"
        const base64Data = base64String.split(',')[1];

        // Convierte base64 a Buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Sube el archivo a Wix Media Manager
        const { fileUrl } = await mediaManager.upload("Manual Signature", buffer, fileName, options);

        return fileUrl;
    } catch (error) {
        console.error("Error uploading base64 image:", error);
        throw error;
    }
})

// =============================================================== FOLDER FUNCTIONS
export const createFolder = webMethod(Permissions.Anyone, async (parentFolderId, displayName, dateOption) => {
    try {
        // Applications Folder
        let options = {
            parentFolderId: parentFolderId
        }

        let afterName = "";

        // Opt 1 - Characters
        // const code = await generateCode();
        // let name = `${displayName} - ${code}`;

        // Opt 2 - Date
        const date = new Date();
        if (dateOption) afterName = `- ${date.toLocaleString()}`;

        let name = `${displayName}${afterName}`;

        const elevateCreateFolder = elevate(folders.createFolder);
        const newFolder = await elevateCreateFolder(name, options);

        console.log("Created folder successfully:", newFolder);

        return newFolder.folder._id;
    } catch (err) {
        console.error(err);
        // Handle the error
    }
});

export const updateDescriptionOfFile = webMethod(Permissions.Anyone, async (file) => {
    try {
        const elevatedUpdateFileDescriptor = elevate(files.updateFileDescriptor);
        const updatedDescriptor = await elevatedUpdateFileDescriptor(file);

        console.log("Updated:", updatedDescriptor);
        return updatedDescriptor;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
}, );

export const xxx = webMethod(Permissions.Anyone, async () => {
    const url = "wix:document://v1/e9838b_1d9d8576a9754375830809b3dc2fc91f.pdf/PDF_2.pdf"
    return url.split('/')
}, );

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        code += chars[randomIndex];
    }

    return code;
}

export const generateFolderDownloadUrl = webMethod(Permissions.Anyone, async (folderId) => {
    try {
        const elevatedGenerateFolderDownloadUrl = elevate(
            folders.generateFolderDownloadUrl,
        );
        const result = await elevatedGenerateFolderDownloadUrl(folderId);

        const folderDownloadUrl = result.downloadUrl;
        return folderDownloadUrl;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
});

// =============================================================== OTHER
export const myListFoldersFunction = webMethod(Permissions.Anyone, async () => {
    try {
        const elevatedListFolders = elevate(folders.listFolders);
        const folderList = await elevatedListFolders();

        console.log("Folders:", folderList);
        return folderList;
    } catch (error) {
        console.error(error);
        // Handle the error
    }
});