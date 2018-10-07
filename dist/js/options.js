let isUnable = false;
let isIcon = false;

chrome.storage.local.get(['rt5ff45tg65uhr'], function(result) {
    console.log('rt5ff45tg65uhr currently is ' + result.rt5ff45tg65uhr);
    isUnable = result.rt5ff45tg65uhr;
});

chrome.storage.local.get(['fyhy9876'], function(result) {
    console.log('fyhy9876 currently is ' + result.fyhy9876);
    isIcon = result.fyhy9876;
});


let radios = document.getElementsByName("lmd-option");
if (isUnable) {
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = radios[i].value === "0";
    }
} else if (isIcon) {
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = radios[i].value === "1";
    }
} else {
    for (let i = 0; i < radios.length; i++) {
        radios[i].checked = radios[i].value === "2";
    }
}

for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", radioClicked);
}

function radioClicked(clickedElement) {
    console.log(clickedElement);
    console.log("clickedElement.target.value is "  + clickedElement.target.value);
    if (clickedElement.target.value === "0") {
        chrome.storage.local.set({rt5ff45tg65uhr: true}, function() {
            console.log('rt5ff45tg65uhr updated true');
        });
    } else if (clickedElement.target.value === "1") {
        chrome.storage.local.set({rt5ff45tg65uhr: false}, function() {
            console.log('rt5ff45tg65uhr updated false');
        });
        chrome.storage.local.set({fyhy9876: true}, function() {
            console.log('fyhy9876 updated true');
        });
    } else {
        chrome.storage.local.set({rt5ff45tg65uhr: false}, function() {
            console.log('rt5ff45tg65uhr updated false');
        });
        chrome.storage.local.set({fyhy9876: false}, function() {
            console.log('fyhy9876 updated false');
        });
    }
}
