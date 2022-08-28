import wixData from 'wix-data';

$w.onReady(function () {
    getDateTraining();
	$w('#send').onMouseIn(() => getDateTraining());
});

async function getDateTraining() {
    await wixData.query("Dateforthetraining")
        .find()
        .then((results) => {
			let x = results.items[0].date.split('-')
			let date = new Date(x[0],(x[1]-1),x[2])
			console.log(date.toDateString())
            $w('#info').text = "Register Form " + date.toDateString();
			if(results.items[0].size > 0){
				$w('#send').enable();
				$w('#message').collapse();
			}else{
				$w('#send').disable();
				$w('#message').expand();
			}
        })
        .catch((err) => {
            console.log(err);
        });
}