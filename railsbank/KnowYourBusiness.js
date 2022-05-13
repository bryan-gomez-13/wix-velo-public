import wixLocation from 'wix-location';

$w.onReady(function () {
	let query = wixLocation.query; 
    if(query.apikey == undefined){
        wixLocation.to('/')
    }else{
        //console.log('Query',query)
        $w("#html1").postMessage(query);
    }
});