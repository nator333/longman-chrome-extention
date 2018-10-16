chrome.storage.local.get(['lmdIsDisable'], function (result) {
    document.getElementById("lmd-isDisable").checked = result.lmdIsDisable;
});

chrome.storage.local.get(['lmdShowIconFirst'], function (result) {
    let radios = document.getElementsByName("lmd-option");
    if (result.lmdShowIconFirst) {
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === "1";
        }
    } else {
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === "2";
        }
    }
});

// AddEventListener
document.getElementById("lmd-isDisable").addEventListener("change", checkboxChanged);
let radios = document.getElementsByName("lmd-option");
for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", radioClicked);
}

/**
 * When checkbox clicked
 *
 * @param checkedElement
 */
function checkboxChanged(checkedElement) {
    chrome.storage.local.set({lmdIsDisable: checkedElement.target.checked}, () => {
    });
    let radios = document.getElementsByName("lmd-option");
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
        chrome.storage.local.set({lmdIsDisable: false}, () => {
        });
        chrome.storage.local.set({lmdShowIconFirst: true}, () => {
        });
    } else {
        chrome.storage.local.set({lmdIsDisable: false}, () => {
        });
        chrome.storage.local.set({lmdShowIconFirst: false}, () => {
        });
    }
}
