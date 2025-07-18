import { searchPage, getAllQuestions } from 'backend/collections.web.js';
import * as wixSiteLocation from '@wix/site-location';

let currentStep = 1;
let answers = {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
    q6: 0,
    q7: 0,
    q8: 0,
    q9: 0,
    q10: 0
};

// Example qValues for reference:
const qValues = {
    q1: 1,
    q2: 2,
    q3: 3,
    q4: 4,
    q5: 5,
    q6: 6,
    q7: 7,
    q8: 8,
    q9: 9,
    q10: 10
};

$w.onReady(function () {
    getQuestionInfo();
    init();
});

function init() {
    // Initialize
    $w('#Questions').onChange(() => {
        console.log('answers', answers)
        console.log('qValues', qValues)
        })

    $w('#Questions').changeState('Question1');
    updateResultDisplay();

    // Set up all next buttons
    for (let i = 1; i <= 10; i++) {
        $w(`#btNext${i}`).onClick(() => {
            answers[`q${i}`] = qValues[`q${i}`];
            if (i < 10) {
                currentStep = i + 1;
                $w('#Questions').changeState(`Question${currentStep}`);
            } else {
                finishQuiz();
            }
            updateResultDisplay();
        });
    }

    // Set up all back buttons
    for (let i = 2; i <= 10; i++) {
        $w(`#btBack${i}`).onClick(() => {
            answers[`q${i}`] = 0;
            currentStep = i - 1;
            $w('#Questions').changeState(`Question${currentStep}`);
            updateResultDisplay();
        });
    }
}

function updateResultDisplay() {
    const total = Object.values(answers).reduce((acc, val) => acc + val, 0);
    $w('#result').text = total.toString();
}

function finishQuiz() {
    const finalResult = Object.values(answers).reduce((acc, val) => acc + val, 0);
    $w('#Questions').changeState('Result');
    $w('#result').text = finalResult.toString();

    searchPage(finalResult).then((url) => {
        setTimeout(() => wixSiteLocation.location.to(url), 3000);
    });
}

async function getQuestionInfo() {
    const items = await getAllQuestions();

    items.forEach(itemInfo => {
        const questionID = `#question${itemInfo.order}`;
        const repID = `#rep${itemInfo.order}`;
        const boxID = `#boxAnswer${itemInfo.order}`;
        const txtID = `#txt${itemInfo.order}`;
        const btNextID = `#btNext${itemInfo.order}`;

        // Set question text
        $w(questionID).text = itemInfo.title;

        // Set repeater data and logic
        $w(repID).data = itemInfo.options;
        $w(repID).onItemReady(($item, itemData) => {
            $item(txtID).text = itemData.label;

            $item(boxID).onClick(() => {
                qValues[`q${itemInfo.order}`] = itemData.value;
                console.log(qValues[`q${itemInfo.order}`])
                $w(btNextID).enable();

                // Highlight selected item
                $w(repID).forEachItem(($item2, itemData2) => {
                    const isSelected = itemData._id === itemData2._id;
                    $item2(boxID).style.backgroundColor = isSelected ? '#FFFFCD' : '#FFFFFF';
                });
            });
        });
    });

    // Only call this once after setting everything up
    $w('#Questions').changeState('Question1');

}