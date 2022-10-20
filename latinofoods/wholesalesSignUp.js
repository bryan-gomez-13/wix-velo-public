import wixLocation from 'wix-location';
import { doRegistration } from 'backend/signIn.jsw';

$w.onReady(function () {
    $w('#submit').onClick(() => registerFirst(0))
    $w('#submit').onMouseIn(() => registerFirst(1))
    $w('#completeAddress').onChange(() => address())
});

function registerFirst(params) {
    try {
        checkValidation();
        if (params == 0) register()
        else if (params == 1) $w('#submit').enable();
    } catch (err) {
        $w('#message').text = err.message;
        $w('#message').show();
    }
}

async function register() {
    $w('#message').hide();
    $w('#submit').disable();
    const contactInfo = {
        'email': $w('#email').value,
        'password': $w('#password').value,
        'options': {
            'contactInfo': {
                'firstName': $w('#firstName').value,
                'lastName': $w('#lastName').value,
                'mobileNumber': $w('#mobilePhone').value
                //'completeAddress': $w('#completeAddress').value.formatted
            }
        }
    }
    console.log(contactInfo)
    let register = await doRegistration(contactInfo);
    console.log(register)
    if (register.status == 'ACTIVE') {
        wixLocation.to('/thank-you-wholesales')
    } else {
        $w('#message').text = 'Registration failed. Try Again';
        $w('#message').show()
        setTimeout(() => $w('#message').collapse(), 10000);
        $w('#text142').text = 'Thanks for submitting!\nSaving the information, do not close the page';
        throw new Error('Registration failed.');
    }

}

function checkValidation() {
    //console.log('here')
    if (!$w('#firstName').valid) throw new Error('Missing first name');
    if (!$w('#lastName').valid) throw new Error('Missing last name');
    if (!$w('#email').valid) throw new Error('Missing email');
    if (!$w('#password').valid) throw new Error('Missing password');
    if ($w('#password').value.length < 6) throw new Error('Password should contain at least 6 characters');
    if (!$w('#mobilePhone').valid) throw new Error('Missing mobile phone');
    if (!$w('#company').valid) throw new Error('Missing company');
    if (!($w('#completeAddress').value)) throw new Error('Please select your address in Delivery address');
    if (!($w('#completeAddress').value.formatted && $w('#completeAddress').value.city && $w('#completeAddress').value.country)) throw new Error('Please select your address in Delivery address');
    if (!$w('#business').valid) throw new Error('Missing business hours');
    if (!$w('#description').valid) throw new Error('Missing business description');
}

function address() {
    if (!($w('#completeAddress').value.formatted && $w('#completeAddress').value.city && $w('#completeAddress').value.country)) {
        $w('#message').text = "Please select your address in Delivery address"
        $w('#message').show();
        setTimeout(() => $w('#message').hide(), 10000);
    } else {
        //$w('#text142').hide();
        $w('#input3').value = $w('#completeAddress').value.streetAddress.number + " " + $w('#completeAddress').value.streetAddress.name;
        $w('#input4').value = $w('#completeAddress').value.city;
        $w('#input5').value = $w('#completeAddress').value.postalCode;
        $w('#input6').value = $w('#completeAddress').value.country;
        //$w('#text142').text = "Thanks for submitting!\nSaving the information, do not close the page";
    }
}