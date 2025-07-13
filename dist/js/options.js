"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
chrome.storage.local.get(['lmdIsDisable']).then((result) => {
    const disableCheckbox = document.getElementById("lmd-isDisable");
    if (disableCheckbox) {
        disableCheckbox.checked = result.lmdIsDisable || false;
    }
});
chrome.storage.local.get(['lmdShowIconFirst']).then((result) => {
    const radios = document.getElementsByName("lmd-option");
    if (result.lmdShowIconFirst) {
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === "1";
        }
    }
    else {
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === "2";
        }
    }
});
chrome.storage.local.get(['lmdPronunciation']).then((result) => {
    const radios = document.getElementsByName("lmd-option");
    if (result.lmdShowIconFirst) {
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === "1";
        }
    }
    else {
        for (let i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === "2";
        }
    }
});
document.getElementById("lmd-isDisable")?.addEventListener("change", checkboxChanged);
const radios = document.getElementsByName("lmd-option");
for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", radioClicked);
}
function checkboxChanged(event) {
    const target = event.target;
    chrome.storage.local.set({ lmdIsDisable: target.checked });
    const radioElements = document.getElementsByName("lmd-option");
    for (let i = 0; i < radioElements.length; i++) {
        radioElements[i].disabled = target.checked;
    }
}
function radioClicked(event) {
    const target = event.target;
    if (target.value === "1") {
        chrome.storage.local.set({ lmdIsDisable: false });
        chrome.storage.local.set({ lmdShowIconFirst: true });
    }
    else {
        chrome.storage.local.set({ lmdIsDisable: false });
        chrome.storage.local.set({ lmdShowIconFirst: false });
    }
}
//# sourceMappingURL=options.js.map