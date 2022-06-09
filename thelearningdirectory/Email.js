import { triggeredEmails } from 'wix-crm-backend';

//Email
export function eMail(json) {
    const emailId = "banner";
    //Yourweb
    const memberYourweb = "ea4ee8b1-c4a9-4099-9358-f851c8d81a15";
    //Other
    const LinkAndLearn = "bb267783-8633-4b06-8687-8e18f840f62b";
    const options = {
        variables: {
            Company: json.Company,
            Name: json.Name,
            Email: json.Email,
            Phone: json.Phone
        }
    }

    triggeredEmails.emailMember(emailId, memberYourweb, options)
        .then(() => {
            console.log("Email Done")
        })
        .catch((error) => {
            console.error(error);
        });
}