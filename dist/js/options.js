let isDisable = false;
let showIconFirst = false;

chrome.storage.local.get(['lmdIsDisable'], function (result) {
    console.log('lmdIsDisable currently is ' + result.lmdIsDisable);
    isDisable = result.lmdIsDisable;
});

chrome.storage.local.get(['lmdShowIconFirst'], function (result) {
    console.log('lmdShowIconFirst currently is ' + result.lmdShowIconFirst);
    showIconFirst = result.lmdShowIconFirst;
});


document.getElementById("lmd-isDisable").checked = isDisable;
let radios = document.getElementsByName("lmd-option");
if (showIconFirst) {
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = radios[i].value === "1";
    }
} else {
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = radios[i].value === "2";
    }
}

// AddEventListener
document.getElementById("lmd-isDisable").addEventListener("change", checkboxChanged);
for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", radioClicked);
}

/**
 * When checkbox clicked
 *
 * @param checkedElement
 */
function checkboxChanged(checkedElement) {
    chrome.storage.local.set({lmdIsDisable: checkedElement.target.checked}, function () {
        console.log('lmdIsDisable updated ' + checkedElement.target.checked);
    });
    for (let i = 0; i < radios.length; i++) {
        radios[i].disabled = checkedElement.target.checked
    }
}

/**
 * When radio clicked
 *
 * @param clickedElement
 */
function radioClicked(clickedElement) {
    if (clickedElement.target.value === "1") {
        chrome.storage.local.set({lmdIsDisable: false}, function () {
            console.log('lmdIsDisable updated false');
        });
        chrome.storage.local.set({lmdShowIconFirst: true}, function () {
            console.log('lmdShowIconFirst updated true');
        });
    } else {
        chrome.storage.local.set({lmdIsDisable: false}, function () {
            console.log('lmdIsDisable updated false');
        });
        chrome.storage.local.set({lmdShowIconFirst: false}, function () {
            console.log('lmdShowIconFirst updated false');
        });
    }
}
