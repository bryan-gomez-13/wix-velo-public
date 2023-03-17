// ====================================== YOURWEB ======================================
import { signUp } from 'backend/signUp.jsw'
$w.onReady(function () {
    $w("#submit").onClick(async () => {
        let json = {
            email: $w('#email').value,
            firstName: $w('#firstName').value
        }
        await signUp(json, $w('#password').value)
        $w('#dataset1').save();
    });
});