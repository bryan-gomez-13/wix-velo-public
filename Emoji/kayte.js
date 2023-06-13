import wixData from 'wix-data';
import wixWindow from 'wix-window';

$w.onReady(() => {
    let init;
    $w('#dataset1').onReady(() => {
        init = $w('#repeater1').data;
        $w('#repeater1').onItemReady(() => repeaterTitleSize())
    });

    $w('#search').onKeyPress(ev => {
        setTimeout(async () => {
            switch (ev.key) {
            case 'Control':
            case 'ArrowRight':
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'ArrowDown':
            case 'Shift':
            case 'Backspace':
            case ' ':
                break;
            case 'Enter':
            default:
                $w('#repeater1').data = await wixData.query('Kaytetyemoji').contains('title', $w('#search').value)
                    .or(wixData.query('Kaytetyemoji').contains('english', $w('#search').value)).ascending("sort").limit(1000)
                    .find()
                    .then(r => {
                        return r.items.map(o => {
                            return {
                                _id: o._id,
                                title: o.title,
                                alt: o.title,
                                src: o.image,
                                type: 'image',
                                link: o['link-kaytetyemoji-title']
                            }
                        });
                    });
                repeaterTitleSize();
            }
        }, 30);
    });

    $w('#clear').onClick(() => {
        if ($w('#search').value.length > 0) {
            $w('#search').value = '';
            $w('#search').resetValidityIndication();
            if (typeof init !== 'undefined') $w('#repeater1').data = init;
        }
    });
});

function repeaterTitleSize() {
    $w('#repeater1').forEachItem(($item, itemData) => {
        let size = 10
        if (wixWindow.formFactor == "Mobile") size = 8

        if (itemData.title.length > size) $item('#name').text = `${itemData.title.substr(0, size)}...`;
        else $item('#name').text = itemData.title;

    })
}