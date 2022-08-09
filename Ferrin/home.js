import wixData from 'wix-data';
var Document;

$w.onReady(function () {
    init();
});

function init() {
    $w('#upload').onChange(() => uploadDocument());
    $w('#submit').onMouseIn(() => validateCV())
    $w("#wixForms1").onWixFormSubmitted((Event) => uploadDB(Event))
}

async function uploadDocument() {
    $w('#submit').disable();
    if ($w("#upload").value.length > 0) { // user chose a file
        await $w("#upload").uploadFiles()
            .then((uploadedFiles) => {
                uploadedFiles.forEach(uploadedFile => {
                    Document = uploadedFile.fileUrl;
                    $w("#text26").hide();
                    $w('#text26').text = 'Thanks for submitting!';
                })
            })
            .catch((uploadError) => {
                $w("#text26").text = "Error: " + uploadError.errorDescription;
                $w("#text26").show();
            });
			$w('#submit').enable();
    } else { // user clicked button but didn't chose a file
        $w("#text26").text = "Please choose a file to upload.";
        $w("#text26").show();
    }
}

function validateCV() {
    if (!(Document.length > 0)) {
        $w("#text26").text = "Please choose a file to upload.";
        $w("#text26").show();
        $w('#submit').disable()
    } else {
        $w('#submit').enable();
        $w("#text26").hide();
        $w('#text26').text = 'Thanks for submitting!';
    }
}

function uploadDB(json) {
    let x;
    for (let i = 0; i < json.fields.length; i++) {
        if (json.fields[i].fieldName == 'Phone') {
            x = i;
            break;
        }
    }
	let phone = json.fields[x].fieldValue
	
	setTimeout(() => {
		wixData.query("contact12")
        .eq('phone', phone)
        .descending('_createdDate')
        .find()
        .then((results) => {
            if (results.items.length > 0) {
				console.log(results.items)
				results.items[0].cv = Document;
                wixData.update("contact12", results.items[0])
                    .then((results) => {
                        console.log(results)
                        console.log('GOOD')
                        //wixLocation.to('/thank-you-wholesales');
                    })
                    .catch((err) => {
                        console.log(err)
                    });
            } 
        })
        .catch((err) => {
            console.log(err)
        });
	}, 3000);
}