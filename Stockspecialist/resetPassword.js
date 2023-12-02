import { signUp, assignPlan } from 'backend/functions.jsw'
import wixLocationFrontend from 'wix-location-frontend';
import wixWindowFrontend from 'wix-window-frontend';
import wixUsers from 'wix-users';

var x = true;
$w.onReady(function () {
    $w('#pass').label = "Password";
    $w('#login').onClick(() => check());
    $w('#btSeePass').onClick(() => {
        if (x) $w('#pass').inputType = "text", x = false;
        else $w('#pass').inputType = "password", x = true;
    })
});

function check() {
    $w('#message').hide();
    try {
        $w('#loading').show();
        $w('#login').disable();
        checkValidation();
        login();
    } catch (error) {
        $w('#loading').show();
        $w('#login').enable();
        console.log("Error", error)
        $w('#message').text = error.message;
        $w('#message').show();
    }
}

function checkValidation() {
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#pass').valid) throw new Error('Missing Password');
    if (!($w('#pass').value.length > 5)) throw new Error('Password must be more than 6 characters');
}

async function login() {
    await signUp($w('#email').value, $w('#pass').value).then(async (result) => {
        //console.log("RR", result)
        if (result.type === 'success N') {
            // Login
            await wixUsers.applySessionToken(result.sessionToken).then(async () => {
                // Assign plan
                let order = await assignPlan($w('#email').value);
                //console.log("ORder", order);
                $w('#loading').hide();
                $w('#messageSuccess').text = result.message;
                $w('#messageSuccess').show();
                wixLocationFrontend.to('/dashboard')
            });
        } else if (result.type === 'New User') {
            $w('#loading').hide();
            $w('#messageSuccess').text = "This is a new email in our system, please sign up here";
            $w('#messageSuccess').show();
            setTimeout(() => wixWindowFrontend.openLightbox("Custom Signup"), 3000);

        } else {
            console.error(`${result.type} error occurred. Error message: ${result.message}`);
            $w('#loading').hide();
            $w('#message').text = `${result.type} error occurred.`;
            $w('#message').show();
        }
    })
}