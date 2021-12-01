import wixData from 'wix-data';

$w.onReady(function () {
	$w('#TScroll').text = "Company";
	teamItems();
});
//Functions of the scroll
export function enter(){
	$w('#boxDown').show();
	$w('#boxUp').hide();
	$w('#slider0').value = 1.6;
}

export function leave(){
	$w('#boxUp').show();
	$w('#boxDown').hide();
}

//Slider function
export function change_Slider(event) {
	let sliderValue = $w("#sliderProducts").value;
	$w('#slideshow1').changeSlide(sliderValue)
}

// Scroll menu
export function One(event) {
	$w('#scrollMenu').hide();
	$w('#slider0').value = 1.6;

}

export function Bye(event) {
	$w('#scrollMenu').show();
}

// Functions
export function about_us(event) {
	$w('#slider1').value = 1.6;
	$w('#slider0').value = 1.6;
}

export function timeline(event) {
	$w('#slider1').value = 3.3;
}

export function mission_Vision(event) {
	$w('#slider1').value = 4.98;
}

export function team(event) {
	$w('#slider1').value = 6.65;
}

export function careers(event) {
	$w('#slider1').value = 8.35;
}

export function newsroom(event) {
	$w('#slider1').value = 10;
}

//Team
export function teamItems(){
	wixData.query("team")
	.ascending("order")
    .find()
    .then((results) => {
        if (results.items.length > 0) {
            for(let i=0; i < results.length; i++){
				let idName1 = "#TName"+(i+1);
				let idName2 = "#TSName"+(i+1);
				$w(idName1).text = results.items[i].title;
				$w(idName2).text = results.items[i].title;
				let idRol1 = "#TRol"+(i+1);
				let idRol2 = "#TSRol"+(i+1);
				$w(idRol1).text = results.items[i].rol;
				$w(idRol2).text = results.items[i].rol;
				let idImage = "#TImage"+(i+1);
				$w(idImage).src = results.items[i].image;
				$w(idImage).tooltip = results.items[i].title;
				$w(idImage).alt = results.items[i].title;
				let idDescription = "#TDescription"+(i+1);
				$w(idDescription).text = results.items[i].description;
				let idLindedin = "#TLinkedin"+(i+1);
				$w(idLindedin).link = results.items[i].linkedin;
			}
        }
    })
    .catch((err) => {
        let errorMsg = err;
    });
}

// Box Open
export function TImage1(event) {
	box(1);
}

export function TImage2(event) {
	box(2);
}

export function TImage3(event) {
	box(3)
}

export function TImage4(event) {
	box(4)
}

export function TImage5(event) {
	box(5)
}

export function TImage6(event) {
	box(6)
}

export function TImage7(event) {
	box(7)
}

export function box(box){
	for(let i=1; i<=7;i++){
		if(box == i){
			let idBox1 = '#TBox'+i;
			let idBox2 = '#TSBox'+i
			$w(idBox1).expand();
			$w(idBox2).expand();
		}else{
			let idBox1 = '#TBox'+i;
			let idBox2 = '#TSBox'+i
			$w(idBox1).collapse()
			$w(idBox2).collapse()
		}
	}
}

// Close Boxs
export function TClose1(event) {
	$w('#TBox1').collapse();
	$w('#TSBox1').collapse();
}

export function TClose2(event) {
	$w('#TBox2').collapse();
	$w('#TSBox2').collapse();
}

export function TClose3(event) {
	$w('#TBox3').collapse();
	$w('#TSBox3').collapse();
}

export function TClose4(event) {
	$w('#TBox4').collapse();
	$w('#TSBox4').collapse();
}

export function TClose5(event) {
	$w('#TBox5').collapse();
	$w('#TSBox5').collapse();
}

export function TClose6(event) {
	$w('#TBox6').collapse();
	$w('#TSBox6').collapse();
}

export function TClose7(event) {
	$w('#TBox7').collapse();
	$w('#TSBox7').collapse();
}