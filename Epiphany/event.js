import wixData from 'wix-data';
import { email } from 'backend/email.jsw'

export function wixCrm_onFormSubmit(event) {
    console.log(event)
    if (event.formName == "Training Session") {
        wixData.query("Dateforthetraining")
            .find()
            .then((results) => {
                results.items[0].size--
                wixData.update("Dateforthetraining", results.items[0])
                    .then((results) => {
                        console.log(results); //see item below
                        email(event.contactId)
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    }
}