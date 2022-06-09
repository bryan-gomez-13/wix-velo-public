import wixLocation from 'wix-location';
import wixData from 'wix-data';
import { Register } from 'backend/signIn.jsw';

$w.onReady(function () {
    $w('#submit').onClick(() => register())
    $w('#submit').onMouseIn(() => zonas())
});

async function register() {
    let country = $w('#country').value
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
    let register = await Register(contactInfo);
    console.log(register)
    if (register.status == 'ACTIVE') {
        //wixLocation.to('/thank-you-wholesales')
        wixData.query("responsiveGridSales023")
            .eq('email', contactInfo.email)
            .descending('_createdDate')
            .find()
            .then((results) => {
                if (results.items.length > 0) {
                    results.items[0].country = country;
                    wixData.update("responsiveGridSales023", results.items[0])
                        .then((results) => {
                            //console.log(results)
                            //wixLocation.to('/thank-you-wholesales');
							console.log('Country OK')
                        })
                        .catch((err) => {
                            console.log(err)
                        });
                } else {
                    // handle case where no matching items found
                }
            })
            .catch((err) => {
                let errorMsg = err;
            });
        console.log('User OK')
    } else {
        $w('#text142').text = 'Registration failed. Try Again';
        $w('#text142').expand()
        setTimeout(() => $w('#text142').collapse(), 10000);
        $w('#text142').text = 'Thanks for submitting!\nSaving the information, do not close the page';
        throw new Error('Registration failed.');
    }

}

// VALIDATION INFO
function zonas() {
    try {
        checkValidation();
        $w('#submit').enable();
        $w('#text142').hide();
        $w('#text142').text = "Thanks for submitting!";
    } catch (error) {
        $w('#submit').disable();
        $w('#text142').text = error.message
        $w('#text142').show();
    }
}

function checkValidation() {
    if (!$w('#firstName').valid) throw new Error('Missing First Name');
    if (!$w('#lastName').valid) throw new Error('Missing Last Name');
    if (!$w('#email').valid) throw new Error('Missing Email');
    if (!$w('#password').valid) throw new Error('Missing password');
    if ($w('#password').value.length < 6) throw new Error('Password should contain at least 6 characters');
    if (!$w('#mobilePhone').valid) throw new Error('Missing Phone');
    if (!$w('#company').valid) throw new Error('Missing Company');

    if (!$w('#address').valid) throw new Error('Missing Address');
    if (!$w('#city').valid) throw new Error('Missing City');
    if (!$w('#postCode').valid) throw new Error('Missing ¨Postal Code');
    if (!$w('#country').valid) throw new Error('Missing Country');
    if (!$w('#businessHour').valid) throw new Error('Missing Business Hour');
    if (!$w('#businessdescription').valid) throw new Error('Missing Business Description');
}