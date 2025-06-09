import { generalQuery, getDropdownJobsOptions_Repeater, getChannelInfo, searchItems } from 'backend/collections.web.js'
import { getDownloadUrlFunction } from 'backend/functions.web.js'
import wixLocationFrontend from 'wix-location-frontend';

let categoryRepInfo, subCategoryRepInfo, categoryLabel, subCategoryLabel;
let arrayDownload2 = [];
let arrayDownload1 = [];

$w.onReady(function () {

    init();
    getDropdownJobsOptions_Repeater('ChannelMarketing', 'category', '', '').then((categoryInfo) => {
        categoryRepInfo = categoryInfo;
        $w('#catRepCategory').data = categoryInfo;
        $w('#catRepCategory').onItemReady(($item, itemData) => {
            $item('#repCategoryLabel').text = itemData.label;
        })
    })

});

function init() {
    // PASSWORD
    $w('#passInPassword').placeholder = 'PASSWORD';

    $w('#passBtAccess').onClick(() => {
        generalQuery('PasswordChannelMarketing', '_id', '547ce936-83d1-4bf3-b526-d0bdfed6b8c4').then((passInfo) => {
            const password = passInfo[0].password;
            if (password == $w('#passInPassword').value) {
                $w('#passSection').collapse();
                $w('#mediaSection').expand();
            } else if ($w('#passInPassword').value == '') {
                $w('#passMessage').text = 'Make sure you enter a password.'
                $w('#passMessage').expand();
            } else {
                $w('#passMessage').text = 'Please enter the correct password.'
                $w('#passMessage').expand();
            }
        })
    })

    // CATEGORY
    $w('#repCategoryBox').onClick((event) => {
        const eventInfo = categoryRepInfo.find(item => item._id == event.context.itemId);

        $w('#subCategoryTitle').text = `${eventInfo.label} >`;
        categoryLabel = (eventInfo.label == 'All') ? '' : eventInfo.label;

        // console.log('categoryLabel', categoryLabel)

        getDropdownJobsOptions_Repeater('ChannelMarketing', 'subCategory', 'category', categoryLabel).then((subCategoryInfo) => {
            // console.log('subCategoryRepInfo', subCategoryInfo)
            subCategoryRepInfo = subCategoryInfo;

            $w('#subCategoryRepCategory').data = [];
            $w('#subCategoryRepCategory').data = subCategoryInfo;
            $w('#subCategoryRepCategory').onItemReady(($item, itemData) => {
                $item('#repSubCategoryLabel').text = itemData.label;
            })

            $w('#boxChannelMedia').changeState('SubCategory');
        })
    })

    $w('#catSearch').onInput(() => {
        if ($w('#catSearch').value !== '') {
            $w('#catRepCategory').collapse();

            searchItems('ChannelMarketing', $w('#catSearch').value).then((documentItems) => {
                arrayDownload1 = documentItems;

                $w('#catRepSearch').data = [];
                $w('#catRepSearch').data = documentItems;
                $w('#catRepSearch').onItemReady(($item, itemData) => {
                    if (itemData.document) $item('#btDownload1').expand();
                    else $item('#btDownload1').collapse();

                    $item('#searchCategoryLabel').text = `${itemData.category.join('')} > ${itemData.subCategory.join('')}`
                    $item('#searchTitleLabel').text = itemData.title;
                })
            })

            $w('#catRepSearch').expand();
        } else {
            $w('#catRepSearch').collapse();
            $w('#catRepCategory').expand();
        }
    })

    $w('#btDownload1').onClick((event) => {
        const documentInfo = arrayDownload1.find(item => item._id == event.context.itemId);
        getDownloadUrlFunction(documentInfo.document).then((url) => {
            wixLocationFrontend.to(url)
        })
    })

    // SUB CATEGORY
    $w('#repSubCategoryBox').onClick((event) => {
        const eventInfo = subCategoryRepInfo.find(item => item._id == event.context.itemId);

        subCategoryLabel = (eventInfo.label == 'All') ? '' : eventInfo.label;
        let category = (categoryLabel == '') ? 'All' : categoryLabel;
        $w('#documentTitle').text = `${category} > ${eventInfo.label}`;

        // console.log('subCategoryLabel', subCategoryLabel)
        repDocuments('')
    })

    $w('#backSubCategory').onClick(() => $w('#boxChannelMedia').changeState('Category'));
    // DOCUMENTS
    $w('#backDocuments').onClick(() => $w('#boxChannelMedia').changeState('SubCategory'));

    $w('#documentSearch').onInput(() => {
        repDocuments($w('#documentSearch').value)
    })

    $w('#btDownload2').onClick((event) => {
        const documentInfo = arrayDownload2.find(item => item._id == event.context.itemId);
        getDownloadUrlFunction(documentInfo.document).then((url) => {
            wixLocationFrontend.to(url)
        })
    })
}

function repDocuments(search) {
    getChannelInfo('ChannelMarketing', 'title', categoryLabel, subCategoryLabel, search).then((documentsInfo) => {
        // console.log('documentsInfo', documentsInfo)
        arrayDownload2 = documentsInfo;

        $w('#repDocuments').data = [];
        $w('#repDocuments').data = documentsInfo;
        $w('#repDocuments').onItemReady(($item, itemData) => {

            if (itemData.document) $item('#btDownload2').expand();
            else $item('#btDownload2').collapse();

            $item('#documentName').text = itemData.title
        })

        $w('#boxChannelMedia').changeState('Documents');
    })
}