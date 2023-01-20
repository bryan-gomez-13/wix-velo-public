$w.onReady(function () {
    let item = $w('#dynamicDataset').getCurrentItem()
    let array = []

    if (item.youtube && item.youtube !== "") array.push({ _id: 'youtube', link: item.youtube, src: "https://static.wixstatic.com/shapes/1ab691_33b4be155bf8462ea05dd5fb6416d5c9.svg" })
    if (item.facebook && item.facebook !== "") array.push({ _id: 'facebook', link: item.facebook, src: "https://static.wixstatic.com/shapes/1ab691_2f3845485fd546fbad7c906762cac13d.svg" })
    if (item.instagram && item.instagram !== "") array.push({ _id: 'instagram', link: item.instagram, src: "https://static.wixstatic.com/shapes/1ab691_a40ee80a180d498aab01334282c61799.svg" })
    if (item.twitter && item.twitter !== "") array.push({ _id: 'twitter', link: item.twitter, src: "https://static.wixstatic.com/shapes/1ab691_b25f5ec75ad34c1eb697e64281e16287.svg" })
    if (item.bandcamp && item.bandcamp !== "") array.push({ _id: 'bandcamp', link: item.bandcamp, src: "https://static.wixstatic.com/shapes/1ab691_c7f13a8c6805483ea538fe4d314b84e3.svg" })
    if (item.artistsMusicLinks && item.artistsMusicLinks !== "") array.push({ _id: 'artistMusicLink', link: item.artistsMusicLinks, src: "https://static.wixstatic.com/shapes/1ab691_fee730de36d54b0eb0dc79a624477b3b.svg" })

    $w('#social').data = array;
    $w('#social').forEachItem(($artist, artistData, index) => {
        $artist('#logo').src = artistData.src
        $artist('#logo').link = artistData.link
    })
});