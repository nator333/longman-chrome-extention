import { StorageResult } from './types.js';

// Load Chrome Storage
chrome.storage.local.get(['lmdIsDisable']).then((result: StorageResult) => {
    const disableCheckbox = document.getElementById("lmd-isDisable") as HTMLInputElement;
    if (disableCheckbox) {
        disableCheckbox.checked = result.lmdIsDisable || false;
    }
});

chrome.storage.local.get(['lmdShowIconFirst']).then((result: StorageResult) => {
    const radios = document.getElementsByName("lmd-option") as NodeListOf<HTMLInputElement>;
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

chrome.storage.local.get(['lmdPronunciation']).then((result: StorageResult) => {
    const radios = document.getElementsByName("lmd-option") as NodeListOf<HTMLInputElement>;
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
document.getElementById("lmd-isDisable")?.addEventListener("change", checkboxChanged);
const radios = document.getElementsByName("lmd-option") as NodeListOf<HTMLInputElement>;
for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", radioClicked);
}

/**
 * When checkbox clicked
 */
function checkboxChanged(event: Event): void {
    const target = event.target as HTMLInputElement;
    chrome.storage.local.set({lmdIsDisable: target.checked});
    
    const radioElements = document.getElementsByName("lmd-option") as NodeListOf<HTMLInputElement>;
    for (let i = 0; i < radioElements.length; i++) {
        radioElements[i].disabled = target.checked;
    }
}

/**
 * When radio clicked
 */
function radioClicked(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    if (target.value === "1") {
        chrome.storage.local.set({lmdIsDisable: false});
        chrome.storage.local.set({lmdShowIconFirst: true});
    } else {
        chrome.storage.local.set({lmdIsDisable: false});
        chrome.storage.local.set({lmdShowIconFirst: false});
    }
}