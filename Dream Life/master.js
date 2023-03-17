import wixWindow from 'wix-window';
import { getColor, getSentence } from 'backend/Oracle.jsw'

$w.onReady(function () {
    $w('#ball').onClick(() => getLighbox())
});

async function getLighbox() {
    let color = await getColor()
    let sentence = await getSentence(color._id)
    wixWindow.openLightbox(color.title, { sentence: sentence.sentence })
}