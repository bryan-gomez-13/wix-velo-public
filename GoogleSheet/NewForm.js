//CREATE
import { appendValuesWrapper } from 'backend/googlesheet-wrapper.jsw';

$w.onReady(function () {
    registerHandlers();
});

function registerHandlers() {
    $w('#appendButton').onClick(() => saveValuesToSheet());
}

async function saveValuesToSheet() {
    const name = $w('#nameInput').value;
    const email = $w('#emailInput').value;
    const values = [name, email];
    try {
        const res = await appendValuesWrapper(values);
        $w('#nameInput').value = '';
        $w('#emailInput').value = '';
        showMessage(res);
    } catch (err) {
        showMessage(err.toString());
    }
}

function showMessage(msg) {
    $w('#showMsg').text = msg;
    $w('#showMsg').expand()
    setTimeout(() => {
        $w('#showMsg').collapse();
    }, 5000);
}

//Update
import { updateValuesWrapper } from 'backend/googlesheet-wrapper.jsw';

$w.onReady(function () {
    registerHandlers();
});

function registerHandlers() {
    $w('#updateButton').onClick(() => updateValuesOnSheet());
}

async function updateValuesOnSheet() {
    const name = $w('#nameInput').value;
    const email = $w('#emailInput').value;
    const values = [name, email];
    try {
        const res = await updateValuesWrapper(values, 'A1:B1', 'ROWS');
        $w('#nameInput').value = '';
        $w('#emailInput').value = '';
        showMessage(res);
    } catch (err) {
        showMessage(err.toString());
    }
}

function showMessage(msg) {
    $w('#showMsg').text = msg;
    $w('#showMsg').expand()
    setTimeout(() => {
        $w('#showMsg').collapse();
    }, 5000);
}