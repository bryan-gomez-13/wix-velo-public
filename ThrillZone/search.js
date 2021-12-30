import wixLocation from 'wix-location';
import {queryF} from 'backend/search'

$w.onReady(function () {
    let query = wixLocation.query;
    queryF(query.q)

    wixLocation.onChange((location) => {
        let query = wixLocation.query;
        queryF(query.q)
    });
});