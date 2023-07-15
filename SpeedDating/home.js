import { createContact, sendEmail } from 'backend/data.jsw'
$w.onReady(function () {
    // ================================================== FIRST
    $w('#next').onClick(() => {
        try {
            check(true);
            $w('#multi').changeState('ContactDetails');
        } catch (err) {
            if (err.message == "iAm") $w('#iAm').focus();
            else $w('#lookingFor').focus();
        }
    });
    $w('#last').onClick(() => $w('#multi').changeState('GetWhoGetsYou'));
    $w('#data').onAfterSave(async () => {
        $w('#multi').changeState('ThankYou');
        let json = {
            firstName: $w('#firstName').value,
            lastName: $w('#lastName').value,
            phoneNumber: $w('#phoneNumber').value,
            email: $w('#email').value,
        }
        await createContact(json);
        await sendEmail(json);
    });
    // ================================================== FOOTER
    $w('#nextF').onClick(() => {
        try {
            check(false);
            $w('#multiF').changeState('ContactDetailsF');
        } catch (err) {
            if (err.message == "iAmF") $w('#iAmF').focus();
            else $w('#lookingForF').focus();
        }
    });
    $w('#lastF').onClick(() => $w('#multiF').changeState('GetWhoGetsYouF'));
    $w('#dataF').onAfterSave(async () => {
        $w('#multiF').changeState('ThankYouF');
        let json = {
            firstName: $w('#firstNameF').value,
            lastName: $w('#lastNameF').value,
            phoneNumber: $w('#phoneNumberF').value,
            email: $w('#emailF').value,
        }
        await createContact(json);
        await sendEmail(json);
    });

});

function check(option) {
    if (option) {
        if (!$w('#iAm').valid) throw new Error('iAm');
        if (!$w('#lookingFor').valid) throw new Error('lookingFor');
    } else {
        if (!$w('#iAmF').valid) throw new Error('iAmF');
        if (!$w('#lookingForF').valid) throw new Error('lookingForF');
    }
}