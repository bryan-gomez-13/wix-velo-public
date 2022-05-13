import wixUsers from 'wix-users';
import wixLocation from 'wix-location';
import wixData from 'wix-data';
var yoga_teacher;
var train_yoga;
var qualification = "";

$w.onReady(function () {

    //var file = $w("#yogaQualificationFile").
    let user = wixUsers.currentUser;

    let userId = user.id; // "r5cme-6fem-485j-djre-4844c49"
    let isLoggedIn = user.loggedIn; // true

    if (isLoggedIn) {
        $w("#memberStrip").collapse();
        $w("#fullWidthSlides1").collapse();
        $w("#buttomSubmit").hide();
        $w("#memberStrip2").expand();
    }
    if (!isLoggedIn && yoga_teacher == 'undefined' && train_yoga == 'undefined') {
        $w("#columnStrip9").expand();
        $w("#memberStrip").collapse();
        $w("#memberStrip2").collapse();

    }

    $w("#dataset1").onBeforeSave(() => {
        let memberTypeValue = $w("#memberType").value;
        qualification = $w("#input8").value;
        $w("#dataset1").setFieldValue("membershipType", memberTypeValue);
        $w("#dataset1").setFieldValue("yogaQualification", qualification);
    })

});

export function inputProfilePicture_change(event, $w) {
    //$w("#button1").enable();
    $w("#imageProfile").src = "https://miro.medium.com/max/296/0*0kRsDyQ0V3rxEzFy.gif";
    if ($w("#inputProfilePicture").value.length > 0) { // user chose a file
        $w("#inputProfilePicture").startUpload()
            .then((uploadedFile) => {
                $w("#imageProfile").src = uploadedFile.url
            })
            .catch((uploadError) => {
                $w("#textUpload").text = "Error: " + uploadError.errorDescription;
                $w("#textUpload").show();
            });
    } else { // user clicked button but didn't chose a file
        $w("#textUpload").text = "Please choose a file to upload.";
        $w("#textUpload").show();
    }
}

export function button1_click(event, $w) {
    if ($w("#inputProfilePicture").value.length > 0) { // user chose a file
        $w("#inputProfilePicture").startUpload()
            .then((uploadedFile) => {
                $w("#imageProfile").src = uploadedFile.url
            })
            .catch((uploadError) => {
                $w("#textUpload").text = "Error: " + uploadError.errorDescription;
                $w("#textUpload").show();
            });
    } else { // user clicked button but didn't chose a file
        $w("#textUpload").text = "Please choose a file to upload.";
        $w("#textUpload").show();
    }
}

export async function buttonSubmit_click_1(event, $w) {

}

export async function buttomSubmit_click(event, $w) {
    // Add your code for this event here: 
    $w("#text22").hide();
    $w("#buttonLogin").hide();

    let firstName = $w("#inputFirstName").value; //
    let lastName = $w("#inputLastName").value; //
    let email = $w("#inputEmail").value; //
    let password = $w("#inputPassword").value; // 
    let phone = $w("#inputPhone").value; //
    let mobilePhone = $w("#inputMobile").value;
    let website = $w("#inputWebsite").value;
    let city = $w("#input6").value; //
    let region = $w("#dropdown3").value; //
    let country = $w("#input7").value;
    let postcode = $w("#input5").value; //
    let address = $w("#input4").value; //
    let suburb = $w("#input3").value;
    let gender = $w("#inputGender").value; //
    //Validation
    let textValidated = "";
    let isValid = false;
    if ($w("#inputFirstName").valid &&
        $w("#inputLastName").valid &&
        $w("#inputEmail").valid &&
        $w("#inputPassword").valid &&
        $w("#inputPhone").valid &&
        $w("#input6").valid &&
        $w('#captcha1').token != undefined &&
        $w("#dropdown3").valid &&
        $w("#input5").valid &&
        $w("#input4").valid &&
        $w("#inputGender").valid) {
        isValid = ($w("#inputFirstName").valid &&
            $w("#inputLastName").valid &&
            $w("#inputEmail").valid &&
            $w("#inputPassword").valid &&
            $w("#inputPhone").valid &&
            $w("#input6").valid &&
            $w('#captcha1').token != undefined &&
            $w("#dropdown3").valid &&
            $w("#input5").valid &&
            $w("#input4").valid &&
            $w("#inputGender").valid);
        //$w("#dataset1").save()
        
        wixUsers.register(email, password)
            .then((item) => {
                console.log("Member created successfully");
                //$w("#text22").text = "";
                $w("#dataset1").save()
                    .then((itemInter) => {
                        console.log("Saved Successful");
                        //wixUsers.login(email, password);
                        //$w("#text22").text ="";
                        wixLocation.to("/become-a-member-thankyou");
                    })
                    .catch((err) => {
                        let errMsg = err;
                    });
                //wixUsers.register(email, password)
            })
            /*.then(() => {
            	
            })*/

            .catch((err) => {
                console.log(err);
                wixData.query("UserDatabase").eq("email", email).find()
                    .then(res => {
                        let item = res.items[0];
                        if (item.active === "Yes") {
                            textValidated = "The email used is already a site member.";
                            //$w("#text22").text = "The email used is already a site member.";
                            $w("#buttonLogin").show();
                        } else {
                            textValidated = "Your application is still in process.";
                            //$w("#text22").text = "Your application is still in process.";
                        }

                    });
                $w("#text22").show();
            });
    } else {
        //$w("#text22").hide();
        if (!isValid) {
            console.log("entra a aqui2");
            textValidated = "Please Complete All Mandatory Fields.";
            //$w("#text22").text = "Please Complete All Mandatory Fields.";
        }

    }
    $w("#text22").text = textValidated;
    await $w("#text22").show();
}

export function button15_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    yoga_teacher = true;
    $w("#fullWidthSlides1").next();
}

export function button17_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    //train yoga yes
    train_yoga = true;
    $w("#fullWidthSlides1").collapse()
    if (yoga_teacher) {
        $w("#memberType").value = "IYTA Teacher";
        qualification = "IYTA Teaching Diploma Course";
        $w("#input8").value = qualification;
        $w("#input8").disable();
        $w("#yogaQualificationFile").hide();
    }

}

export function button16_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    //train yoga false No
    train_yoga = false;
    if (yoga_teacher) {
        $w("#fullWidthSlides1").collapse()
        $w("#memberType").value = "Other Teacher";
        $w("#yogaQualificationFile").show()
        $w("#input8").enable();
        $w("#input8").value = "";
        $w("#text85").show()
    }

}

export function noTeacher_click(event) {
    // This function was added from the Properties & Events panel. To learn more, visit http://wix.to/UcBnC-4
    // Add your code for this event here: 
    yoga_teacher = false;
    $w("#fullWidthSlides1").collapse()
    $w("#memberType").value = "General member";
    $w("#yogaQualificationFile").hide();
    $w("#input8").hide();
}