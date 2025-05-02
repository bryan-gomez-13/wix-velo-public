import { currentMember } from "wix-members-frontend";
import wixData from 'wix-data';

$w.onReady(function () {
    currentMember.getMember({ fieldsets: ['FULL'] }).then((member) => {
        memberInfo(member._id)
    }).catch((error) => { console.error(error); });
});

function memberInfo(memberId) {
    let filter = wixData.filter().eq('memberId', memberId);
    $w('#dataMemberDocuments').setFilter(filter).then(() => {
        $w('#dataMemberDocuments').onReady(() => {
            if ($w('#dataMemberDocuments').getTotalCount() > 0) $w('#memRepDocuments').expand(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
            else $w('#memRepDocuments').collapse(), $w('#messageNoFiles').text = `${$w('#dataMemberDocuments').getTotalCount()} Files`;
        })
    });
}