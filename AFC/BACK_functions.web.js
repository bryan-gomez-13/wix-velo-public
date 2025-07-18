import { webMethod, Permissions } from "wix-web-module";
import { contacts } from "wix-crm-backend";
import { files } from "wix-media.v2";
import { elevate } from "wix-auth";
import { mediaManager } from 'wix-media-backend';
import { Buffer } from 'buffer';

export const getContactInfo = webMethod(Permissions.Anyone, (_id) => {
    const options = { suppressAuth: true, };

    return contacts.getContact(_id, options)
        .then((contact) => { return contact; })
        .catch((error) => { console.error(error); });
});

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
  const item = await mediaManager.getFileInfo(fileUrl);
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