import { triggeredEmails } from 'wix-crm-backend';

//	==================================================================== M E M B E R S H I P ====================================================================
// Life members
export function Email_Life_Member(json) {
    const emailId = "Email_Life_Member";
    //Email of the owner
    const memberId = json.idPrivateMember;

    return triggeredEmails.emailMember(emailId, memberId)
        .then(() => {
            console.log("Email life member");
        })
        .catch((error) => {
            console.error(error);
        });
}

//New members
export function Email_New_Member(json) {
    const emailId = "Email_New_Member";
    //Email of the owner
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            SubmissionDate: json.date,
			FullName: json.fullName
        }
    }

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email new member");
        })
        .catch((error) => {
            console.error(error);
        });
}

//Renewal
export function Email_Renewal(json) {
    const emailId = "Email_Renewal";
    //Email of the owner
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            date: json.date,
			fullName: json.fullName
        }
    }

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email new member");
        })
        .catch((error) => {
            console.error(error);
        });
}

//	==================================================================== T R A I N I N G ====================================================================
//OWNER
export function Email_Training_Owner(json) {
    const emailId = "Email_Training_Owner";
    //Email of the owner
    //=============================================================== IMPORTANT CHANGE ===============================================================
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            date: json.date,
            FullName: json.FullName,
            DogName: json.DogName,
            DogBreed: json.DogBreed,
            DogDate: json.DogDate,
            Genero: json.Genero,
            Email: json.Email,
            EmailConfirm: json.EmailConfirm,
            Mobile: json.Mobile,
            Address: json.Address,
            Indicate: json.Indicate,
            Hear: json.Hear,
            Anything: json.Anything,
            Under15: json.Under15,
            Age: json.Age,
            Aggression: json.Aggression
        }
    }

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email Training Owner");
        })
        .catch((error) => {
            console.error(error);
        });
}

//SENDER
export function Email_Training_Sender(idPrivateMember) {
    const emailId = "Email_Training_Sender";
    //Email of the owner
    const memberId = idPrivateMember;

    return triggeredEmails.emailMember(emailId, memberId)
        .then(() => {
            console.log("Email Training Sender");
        })
        .catch((error) => {
            console.error(error);
        });
}

//PAYMENT
export function Email_Training_Payment(json) {
    const emailId = "Email_Training_Payment";
    //Email of the owner
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            FullName: json.FullName,
            DogName: json.DogName,
            Date: json.date
        }
    }
    //console.log(options)

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email Training Payment");
        })
        .catch((error) => {
            console.error(error);
        });
}

//	==================================================================== A G I L I T Y ====================================================================
//OWNER
export function Email_Agility_Owner(json) {
    const emailId = "Email_Agility_Owner";
    //Email of the owner
    //=============================================================== IMPORTANT CHANGE ===============================================================
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            date: json.date,
            FullName: json.FullName,
            DogName: json.DogName,
            DogBreed: json.DogBreed,
            DogDate: json.DogDate,
            Genero: json.Genero,
            Email: json.Email,
            EmailConfirm: json.EmailConfirm,
            Mobile: json.Mobile,
            Address: json.Address,
            Indicate: json.Indicate,
            Hear: json.Hear,
            Anything: json.Anything,
            Under15: json.Under15,
            Age: json.Age
        }
    }

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email Agility Owner");
        })
        .catch((error) => {
            console.error(error);
        });
}

//PAYMENT
export function Email_Agility_Payment(json) {
    const emailId = "Email_Agility_Payment";
    //Email of the owner
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            DogName: json.DogName,
            Date: json.date
        }
    }
    //console.log(options)

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email Agility Payment");
        })
        .catch((error) => {
            console.error(error);
        });
}

//	==================================================================== B A B Y P P S ====================================================================
//OWNER
export function Email_BabyPPS_Owner(json) {
    const emailId = "Email_BabyPPS_Owner";
    //Email of the owner
    //=============================================================== IMPORTANT CHANGE ===============================================================
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            date: json.date,
            FullName: json.FullName,
            DogName: json.DogName,
            DogBreed: json.DogBreed,
            DogDate: json.DogDate,
            Genero: json.Genero,
            Email: json.Email,
            EmailConfirm: json.EmailConfirm,
            Mobile: json.Mobile,
            Address: json.Address,
            Indicate: json.Indicate,
            Hear: json.Hear,
            Anything: json.Anything,
            Under15: json.Under15,
            Age: json.Age,
            question: json.question
        }
    }

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email BabyPPS Owner");
        })
        .catch((error) => {
            console.error(error);
        });
}

//PAYMENT
export function Email_BabyPPS_Payment(json) {
    const emailId = "Email_BabyPPS_Payment";
    //Email of the owner
    const memberId = json.idPrivateMember;
    const options = {
        variables: {
            DogName: json.DogName,
            date: json.date
        }
    }
    //console.log(options)

    return triggeredEmails.emailMember(emailId, memberId, options)
        .then(() => {
            console.log("Email BabyPPS Payment");
        })
        .catch((error) => {
            console.error(error);
        });
}