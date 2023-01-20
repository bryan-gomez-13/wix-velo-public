$w.onReady(function () {
	let item = $w('#dynamicDataset').getCurrentItem()
	let array = []

    if (item.youTube && item.youTube !== "") array.push({ _id: 'youtube', link: item.youTube, src: "https://static.wixstatic.com/shapes/1ab691_33b4be155bf8462ea05dd5fb6416d5c9.svg" })
    if (item.facebook && item.facebook !== "") array.push({ _id: 'facebook', link: item.facebook, src: "https://static.wixstatic.com/shapes/1ab691_2f3845485fd546fbad7c906762cac13d.svg" })
    if (item.instagram && item.instagram !== "") array.push({ _id: 'instagram', link: item.instagram, src: "https://static.wixstatic.com/shapes/1ab691_a40ee80a180d498aab01334282c61799.svg" })
    if (item.linkedIn && item.linkedIn !== "") array.push({ _id: 'linkedIn', link: item.linkedIn, src: "https://static.wixstatic.com/shapes/73f5ce_68010ed5f531474880f7573d2e9bd288.svg" })

    $w('#social').data = array;
    $w('#social').forEachItem(($artist, artistData, index) => {
        $artist('#logo').src = artistData.src
        $artist('#logo').link = artistData.link
    })
});