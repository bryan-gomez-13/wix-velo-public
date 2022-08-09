import { session } from 'wix-storage';
import wixLocation from 'wix-location';

$w.onReady(function () {
	//Save query of the url
	//Test with this url https://www.thornegroup.co.nz/?fbclid=IwAR1t76Jbm_wdlo8qxkFUd78wnjqWzU1DxC8WTRMKH7tsI3bDROMEV7WXWDI
    /*
	if (!(session.getItem("campaign"))) {
        if (wixLocation.query) {
            session.setItem("campaign", wixLocation.query.fbclid);
        }
    }
	*/
	//Test for the campaign
	//Test with this link https://www.thornegroup.co.nz/contact?utm_source=facebook&utm_medium=medium&utm_campaign=campaign&gtm_debug=1657270176835
    if ( !(session.getItem("campaign")) ) {
        if (wixLocation.query) {
            session.setItem("source", wixLocation.query['utm_source']);
			session.setItem("medium", wixLocation.query['utm_medium']);
			session.setItem("campaign", wixLocation.query['utm_campaign']);
        }
    }
});