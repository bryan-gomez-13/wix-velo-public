import wixData from 'wix-data';

$w.onReady(function () {
	filterData();
});

function filterData() {
	let filter = wixData.filter();
	let dnow = new Date();
	filter = filter.eq('active',true).and(filter.eq('category','Lenguage & Culture')).and(filter.ge('dateFinalCourse', dnow));
	$w('#dataset17').setFilter(filter);
	console.log(filter);
}

/*

FREE launch promo
3f7325a4-5b0f-45dd-9397-b9a3ce1f2dd4 

cheap and cheerful
3bbb3d86-e37d-46e8-b7fe-b2357b08a55c

cheap + more cheerfu
206f9520-8619-468c-90ef-190798511246

feature it
13b985c8-bef6-454e-90bf-7fb562ff6cb3

eye catching banner
d6a54e3d-e9db-4740-8dbe-102825b55ec3

*/