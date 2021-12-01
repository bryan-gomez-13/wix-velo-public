import wixUsers from 'wix-users';
import wixWindow from 'wix-window';
import {sendEmail} from 'backend/email';

var itemObj = $w("#dynamicDataset").getCurrentItem();
let user = wixUsers.currentUser;
var userEmail;

$w.onReady(function () {
	user.getEmail()
		.then( (email) => {
		userEmail = email;      // "user@something.com"
	});

});

export function button2_click(event) {
	//console.log(itemObj._id)
	wixWindow.openLightbox("Remove Contact", {
    	"id": itemObj._id
  	})
}

export async function button3_click(event) {
	let myparams = {
			"from_user_correo": userEmail,
			"from_wix_user": $w('#text5').text,
			"to_name": $w('#firstName').text + ' ' + $w('#lastName').text,
			"message": $w('#message').value
		};
	console.log(myparams);
	await sendEmail (myparams).then(result => {
		let x = result;
		console.log(x);
	});
}

//======================================================================================================

import {fetch} from 'wix-fetch';
import wixSecretsBackend from 'wix-secrets-backend';

export async function sendEmail(params) {
	//const userid = "user_zrYuuVCIINqzoESWKZodu"; // put your emailjs userid here (look in Account)
	const userid = await wixSecretsBackend.getSecret("userid");
	const url = "https://api.emailjs.com/api/v1.0/email/send";

	let full_params = {
		"user_id": userid,
		"service_id": "gmail",
		"template_id": "wix_certification",
		"template_params": params
	};
	const headers = {
		"Content-type": "application/json"
	};
	const request = {
		method: 'POST',
		headers: headers,
		body: JSON.stringify(full_params)
	};
	return fetch(url, request)
		.then((httpResponse) => {
            if (httpResponse.ok) {
				let x = '1'
				return x
                console.log('Your mail is sent!');
            } else {
                return httpResponse.text()
                    .then(text => Promise.reject(text));
            }
        })
        .catch((error) => {
			let x = error;
			return x
            console.log('Oops... ' + error);
        });
}