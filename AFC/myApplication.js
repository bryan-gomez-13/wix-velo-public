import { currentMember } from "wix-members-frontend";
import { generalQuery } from 'backend/collections.web.js';
import wixData from 'wix-data';

$w.onReady(function () {
    currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
        memberInfo(member._id)
    }).catch((error) => { console.error(error); });

    init();
});

function init() {
    $w('#btApplications').onClick(() => {
        $w('#btApplications').disable();
        $w('#btCertifications').enable();
        $w('#box').changeState('Applications');
    });
    $w('#btCertifications').onClick(() => {
        $w('#btApplications').enable();
        $w('#btCertifications').disable();
        $w('#box').changeState('Certifications')
    });
}

function memberInfo(memberId) {
    let filter = wixData.filter().eq('memberId', memberId);
    $w('#dataMemberDocuments').setFilter(filter).then(() => {
        $w('#dataMemberDocuments').onReady(() => {
            if ($w('#dataMemberDocuments').getTotalCount() > 0) $w('#memRepDocuments').expand(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
            else $w('#memRepDocuments').collapse(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
        })
    });

    generalQuery('Members', 'memberId', memberId).then((memberInfo) => {
        const itemMemberInfo = memberInfo[0];
        $w('#repApplications').data = itemMemberInfo.forms;
        $w('#repApplications').onItemReady(($item, itemData) => {
            $item('#appProgram').text = itemData.formName;
            $item('#appStatus').text = itemData.status;
        })

        $w('#box').changeState('Applications')
    })
}