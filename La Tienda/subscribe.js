import wixLocationFrontend from 'wix-location-frontend';
import { registerNewMember } from 'backend/functions.web.js';
import { authentication } from "wix-members-frontend";

$w.onReady(function () {
    $w('#subscribeForm').onSubmit(async (event) => {
        const json = {
            firstName: event['first_name_8215'],
            lastName: event['last_name_58e1'],
            email: event['email_443e'],
            password: event['password'],
        }

        const register = await registerNewMember(json);
        authentication.applySessionToken(register.sessionToken).then(() => {
            wixLocationFrontend.to('/thank-you-for-signing-up')
        });
    })

});