import { currentMember } from 'wix-members';
import { getMemberBack, updateTeacherApply, updateCourseTeacher, getEnrolledLearners } from 'backend/Collections.jsw'
import wixData from 'wix-data';
import wixWindow from 'wix-window';

var privateId, jsonRole, arrayTags, dataClass

$w.onReady(async function () {
    init()
    await initialFunctions();
});

function init() {
    // ========================================== TEACHER AREA ==========================================
    // ===================== APPLY BUTTON =====================
    $w('#applySave').onClick(() => $w('#loadingApply').show())
    $w('#applyBtn').onClick(() => $w('#box').changeState('TeacherApply'))
    // ===================== AFTER SAVE APPLY =====================
    $w('#applyDataset').onAfterSave(async (apply) => {
        $w('#loadingApply').hide();
        await updateTeacherApply(apply, privateId)
        await initialFunctions();
        $w('#section5').scrollTo();
    })
    // ===================== AFTER SAVE COURSE =====================
    $w('#saveCourse').onClick(() => $w('#loadingCourse').show())
    $w('#tags').onInput(() => {
        arrayTags = $w('#tags').value.split('-')
    })
    $w('#createCourseDataset').onAfterSave(async (course) => {
        $w('#loadingCourse').hide();
        let name = jsonRole.name + " " + jsonRole.surname
        let email = jsonRole.email
        let aboutMe = jsonRole.aboutMe
        let image = jsonRole.image
        await updateCourseTeacher(course, privateId, arrayTags, name, aboutMe, image, email)
        await initialFunctions();
        $w('#section5').scrollTo();
    })
    // ===================== TEACHER CLASSES =====================
    $w('#btCreateClass').onClick(() => {
        let index = "2"
        $w('#repMenu').forEachItem(($item2, itemData2) => {
            if (itemData2._id == index) $item2('#btMenu').disable();
            else $item2('#btMenu').enable();
        });
        $w('#box').changeState('TeacherCreateCourse')
    })
    $w('#goBackInfoClass').onClick(() => $w('#box').changeState('TeacherClasses'))
    $w('#deleteClass2').onClick(() => wixWindow.openLightbox("Delete Class", dataClass))
    $w('#repTeacherCourses').onItemReady(($item, itemData) => {
        $item('#teacherBtEnrolled').onClick(() => teacherInfoClass(itemData))
        $item('#teacherBtDeleteClass').onClick(() => wixWindow.openLightbox("Delete Class", itemData))
    })
}

// ==================================================================================== INITIAL FUNCTIONS ====================================================================================
async function initialFunctions() {
    await getCurrentMember();
    await menu();
    if (jsonRole.role == "Teacher") await teacherCoursesFilter();
    else await parentCoursesFilter();
}

async function getCurrentMember() {
    let options = { fieldsets: ['FULL'] }
    await currentMember.getMember(options).then(async (member) => {
            privateId = member._id
            let json = await getMemberBack(privateId)
            console.log(json)
            jsonRole = json
            $w('#applyEmail').value = json.email
            if (jsonRole.noExist) {
                $w('#messageCourse').text = "You have to apply to become a teacher in order to publish your course"
                disableItemsCreateCourse();
            } else if (jsonRole.applyAproved) {
                $w('#messageCourse').text = "Create Course"
                enableItemsCreateCourse()
            } else {
                $w('#messageCourse').text = "Your application is being verified..."
                disableItemsCreateCourse();
            }
            //$w('#instructorName').value = json.name + " " + json.surname

            if (json.role == "Teacher") $w('#section4').expand(), $w('#box').changeState('TeacherHome');
            else $w('#box').changeState('ParentSchedule');
        })
        .catch((error) => console.error(error));
}

function disableItemsCreateCourse() {
    $w('#input1').disable();
    $w('#uploadButton1').disable();
    $w('#input3').disable();
    $w('#input2').disable();
    $w('#richTextBox1').disable();
    $w('#richTextBox2').disable();
    $w('#input5').disable();
    $w('#input6').disable();
    $w('#parentDateBirth').disable();
    $w('#datePicker1').disable();
    $w('#timePicker1').disable();
    $w('#timePicker2').disable();
    $w('#input7').disable();
    $w('#input8').disable();
    $w('#dropdown1').disable();
    $w('#input9').disable();
    $w('#input10').disable();
    $w('#input11').disable();
    $w('#tags').disable();
    $w('#input13').disable();
    $w('#input14').disable();
    $w('#saveCourse').disable();
}

function enableItemsCreateCourse() {
    $w('#input1').enable();
    $w('#uploadButton1').enable();
    $w('#input3').enable();
    $w('#input2').enable();
    $w('#richTextBox1').enable();
    $w('#richTextBox2').enable();
    $w('#input5').enable();
    $w('#input6').enable();
    $w('#parentDateBirth').enable();
    $w('#datePicker1').enable();
    $w('#timePicker1').enable();
    $w('#timePicker2').enable();
    $w('#input7').enable();
    $w('#input8').enable();
    $w('#dropdown1').enable();
    $w('#input9').enable();
    $w('#input10').enable();
    $w('#input11').enable();
    $w('#tags').enable();
    $w('#input13').enable();
    $w('#input14').enable();
    $w('#saveCourse').enable();
}

function menu() {
    let arrayM = []
    if (jsonRole.role == "Teacher") {

        arrayM.push({ _id: "0", label: "Home", value: "TeacherHome" })
        if (jsonRole.menuApply) arrayM.push({ _id: "1", label: "Become a Teacher", value: "TeacherApply" })
        arrayM.push({ _id: "2", label: "Create Course", value: "TeacherCreateCourse" })
        arrayM.push({ _id: "3", label: "My courses", value: "TeacherClasses" })

    } else {
        arrayM.push({ _id: "0", label: "Schedule", value: "ParentSchedule" })
        arrayM.push({ _id: "1", label: " My classes", value: "ParentSearchClass" })
    }

    $w('#repMenu').data = arrayM
    $w('#repMenu').onItemReady(($item, itemData, index) => {
        if (index == 0) $item('#btMenu').disable();
        else $item('#btMenu').enable();
        $item('#btMenu').label = itemData.label;
        $item('#btMenu').onClick(() => {
            $w('#box').changeState(itemData.value);
            $w('#repMenu').forEachItem(($item2, itemData2) => {
                if (itemData._id == itemData2._id) $item2('#btMenu').disable();
                else $item2('#btMenu').enable();
            });
        })
    })

}

function teacherCoursesFilter() {
    let dnow = new Date();
    let filter = wixData.filter();
    let sort = wixData.sort();

    //Filter
    filter = filter.and(wixData.filter().eq("privateId", privateId));
    filter = filter.and(wixData.filter().eq("aproved", true));
    filter = filter.and(wixData.filter().ge("startingDate", dnow));
    //Sort
    sort = sort.ascending("startingDate");

    $w('#courseTeacherDataset').setFilter(filter);
    $w("#courseTeacherDataset").setSort(sort);

}

function parentCoursesFilter() {
    let dnow = new Date();
    let filter = wixData.filter();
    let sort = wixData.sort();

    //Filter
    filter = filter.and(wixData.filter().eq("aproved", true));
    filter = filter.and(wixData.filter().ge("startingDate", dnow));
    //Sort
    sort = sort.ascending("startingDate");

    $w('#parentCoursesDataset').setFilter(filter);
    $w("#parentCoursesDataset").setSort(sort);
}

// ==================================================================================== TEACHER ====================================================================================
async function teacherInfoClass(data) {
    dataClass = data
    let learnersInfo = await getEnrolledLearners(data);
    $w('#txtInfoClass').text = data.title + " - Students Enrolled " + learnersInfo.length
    $w('#repInfoClass').data = learnersInfo
    $w('#repInfoClass').onItemReady(($item, itemData) => {
        $item('#imgInfoClass').src = itemData.image
        $item('#imgInfoClass').alt = itemData.name
        $item('#imgInfoClass').tooltip = itemData.name
        $item('#txtNameInfoClass').text = itemData.name

        let dBirth = new Date(itemData.birth)
        let dNow = new Date()
        let diffTime = Math.abs(dNow - dBirth);
        let years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));

        $item('#txtAgeInfoClass').text = years + ""
        $item('#btMoreInfoClass').onClick(() => wixWindow.openLightbox("Learner Info Teacher", itemData))
    })
    $w('#box').changeState('TeacherInfoClass')
}
// ==================================================================================== PARENT ====================================================================================