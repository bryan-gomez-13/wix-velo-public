import { Permissions, webMethod } from "wix-web-module";
import wixSecretsBackend from "wix-secrets-backend";

const baseUrl = 'https://api-manosiuntos.post.lt';

export const getAccessToken = webMethod(Permissions.Anyone, async () => {
    const username = await wixSecretsBackend.getSecret("username");
    const password = await wixSecretsBackend.getSecret("password");

    // URL con parámetros
    const url = `${baseUrl}/oauth/token?scope=read%2Bwrite%2BAPI_CLIENT&grant_type=password&clientSystem=PUBLIC&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Obtener respuesta
        const json = await response.json();
        return json;

    } catch (err) {
        console.error('Error obteniendo token:', err);
        throw new Error('No se pudo obtener el token de acceso');
    }
});

export const getTerminals = webMethod(Permissions.Anyone, async (country) => {
    const accessData = await getAccessToken();
    const token = accessData['access_token'];

    // URL with parameters
    const url = `${baseUrl}/api/v2/terminal?senderCountryCode=EE&receiverCountryCode=${country}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Important prefix
            }
        });

        // Parse and return JSON response
        const json = await response.json();
        const updatedData = json.map(item => ({
            ...item, // Keep all existing properties
            _id: String(item.id) // Add _id as string
        }));
        return updatedData;

    } catch (err) {
        console.error('Error obteniendo terminales:', err);
        throw new Error('No se pudieron obtener los terminales');
    }
});