import { generalQuery, bulkInsertCollection, deleteItemFromCollection } from 'backend/collections.web.js';
import { emailAdditionalInformationAdmin } from 'backend/email.web.js';
import { currentMember } from "wix-members-frontend";
import wixData from 'wix-data';
import wixLocationFrontend from "wix-location-frontend";

let memberId = '';

$w.onReady(function () {
    if (wixLocationFrontend.query.formId) {
        submissionInfo(wixLocationFrontend.query.formId)
        getMember().then(() => filterSubmissions())
        init();
    }
});

async function getMember() {
    return currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
            memberId = member._id;
            return memberId
        })
        .catch((error) => { console.error(error); });
}

// ==================================================== INIT
function init() {
    // DATA
    $w('#dataFormSubmissions').onReady(() => $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions`);

    $w('#repSubmissions').onItemReady(($item, itemData) => {
        $item('#subName').text = `${itemData.firstName} ${itemData.surname}`;
        $item('#boxSubmissions').onClick(() => submissionInfo(itemData._id));
    })

    // STATE SUBMISSIONS INFO
    $w('#btSaveDocument').onClick(() => saveAdditionalInformation());

    $w('#aiRep').onItemReady(($item, itemData) => {
        $item('#deleteDocument').onClick(() => {
            deleteItemFromCollection('Additionalinformation', itemData._id).then(() => { refreshMemberDocuments(); })
        })
    })
}

// ==================================================== STATE SUBMISSIONS
function filterSubmissions() {
    let filter = wixData.filter().eq('memberId', memberId);

    $w('#dataFormSubmissions').setFilter(filter).then(() => {
        $w('#dataFormSubmissions').onReady(() => { $w('#totalSubmissions').text = `${$w('#dataFormSubmissions').getTotalCount()} Submissions` });
    })
}

// ==================================================== STATE SUBMISSION INFO
function submissionInfo(submissionId) {
    let filter = wixData.filter().eq('_id', submissionId);
    $w('#dataSubmissionItemInfo').setFilter(filter).then(() => {
        $w('#dataSubmissionItemInfo').onReady(() => {
            const item = $w('#dataSubmissionItemInfo').getCurrentItem();
            $w('#status').text = `Status: ${item.status}`
            if (item.additionalInformation) {
                let filterAdditionalInformation = wixData.filter().eq('submission', item._id);
                $w('#uploadMemberDocument').expand();
                $w('#btSaveDocument').expand();

                $w('#dataAdditionalInformation').setFilter(filterAdditionalInformation).then(async () => {
                    if ($w('#dataAdditionalInformation').getTotalCount() > 0) {
                        $w('#aiRep').expand();
                    } else {
                        const message = await generalQuery('HystoryAdditionalInformationEmail', 'formId', submissionId);
                        $w('#additionalInfoMessage').text = message[0].message;
                        $w('#additionalInfoMessage').expand();
                        $w('#aiRep').collapse();
                    }
                })

            } else {
                $w('#aiRep').collapse();
                $w('#uploadMemberDocument').collapse();
                $w('#btSaveDocument').collapse();
            }
        })
    });

    $w('#adminStates').changeState('SubmissionInfo');
}

function saveAdditionalInformation() {
    const submission = $w('#dataSubmissionItemInfo').getCurrentItem();

    $w("#uploadMemberDocument").uploadFiles().then((uploadedFiles) => {
        let documents = [];
        uploadedFiles.forEach((document) => {
            documents.push({
                title: document.originalFileName,
                submission: submission._id,
                document: document.fileUrl
            })
        })

        bulkInsertCollection('Additionalinformation', documents).then(() => { refreshMemberDocuments() });
        const json = {
            userName: `${submission.firstName} ${submission.surname}`,
            email: submission.emailAddress,
            submission: submission._id,
            formName: submission.title
        }

        emailAdditionalInformationAdmin(json);

    }).catch((uploadError) => console.log(uploadError));
}

function refreshMemberDocuments() {
    $w('#dataAdditionalInformation').refresh().then(() => {
        $w('#uploadMemberDocument').reset();
        $w('#dataAdditionalInformation').onReady(() => {
            if ($w('#dataAdditionalInformation').getTotalCount() > 0) $w('#aiRep').expand();
            else $w('#aiRep').collapse();
        })
    })
}