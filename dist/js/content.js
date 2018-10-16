const FRAME_WIDTH = 450;
const FRAME_HEIGHT = 300;
const API_DOMAIN = "https://api.pearson.com";
const LMD_UTL = "https://www.ldoceonline.com/dictionary/";
const EXAMPLE_PREFIX = "ex) ";
const DOCUMENT_BODY = document.body;
const DOCUMENT_ELM = document.documentElement;
const ICON_DIV = document.createElement("div");
const IMAGE_DIV = document.createElement("div");

let isIconAdded = false;
let bubbleDiv = void 0;
let selectionText = "";
let selectionClientX = 0;
let selectionBoundingClientRect = void 0;

ICON_DIV.classList.add("lmd-icon");
IMAGE_DIV.classList.add("lmd-icon-img");
ICON_DIV.appendChild(IMAGE_DIV);

chrome.storage.local.get(['lmdIsDisable'], function (result) {
    if (!result.lmdIsDisable) {
        console.log('lmdIsDisable currently is ' + result.lmdIsDisable);
        DOCUMENT_BODY.addEventListener("mouseup", somethingSelected, false);
    }
});

/**
 * Fired when something selected, display icon
 *
 * @param mouseUpContent
 * @returns {*}
 */
function somethingSelected(mouseUpContent) {
    if (bubbleDiv && !mouseUpContent.target["classList"].contains('lmd')) {
        return void(DOCUMENT_BODY.removeChild(bubbleDiv) && (bubbleDiv = null))
    }

    if (mouseUpContent.target.tagName && mouseUpContent.target.tagName.toLocaleLowerCase() === "input") {
        return void(true)
    } else {
        console.log(mouseUpContent.target.tagName)
    }

    chrome.storage.local.get(['lmdShowIconFirst'], function (result) {
        console.log('lmdShowIconFirst currently is ' + result.lmdShowIconFirst);
        if (result.lmdShowIconFirst) {
            setTimeout(() => {
                displayIcon(mouseUpContent)
            });
        } else {
            setTimeout(() => {
                displayBubble(mouseUpContent)
            });
        }
    });

}

/**
 *
 *
 * @param mouseUpContent
 */
function displayIcon(mouseUpContent) {
    let selectionObj = window.getSelection();
    let selectionTextForCheck = selectionObj
        .toString()
        .replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ")
        .trim();

    if (!selectionTextForCheck || selectionTextForCheck.includes(" ")
        || !(selectionTextForCheck.match(/^[a-zA-Z]+$/))) {
        if (isIconAdded && DOCUMENT_BODY.removeChild(ICON_DIV)) {
            isIconAdded = false;
        }
        return;
    }

    if (!selectionTextForCheck.endsWith("day")) {
        selectionTextForCheck = selectionTextForCheck.toLowerCase();
    }
    selectionText = selectionTextForCheck;
    let parentBoundingClientRect = DOCUMENT_BODY.parentNode.getBoundingClientRect();

    if (mouseUpContent.target === ICON_DIV) {
        return
    }

    selectionClientX = mouseUpContent.clientX;
    selectionBoundingClientRect = selectionObj.getRangeAt(0).getBoundingClientRect();
    let selectionHeightPlus28 = -1;
    if (Math.abs(mouseUpContent.clientY - selectionBoundingClientRect.top) >
        selectionBoundingClientRect.bottom - selectionBoundingClientRect.clientY) {
        selectionHeightPlus28 = selectionBoundingClientRect.height + 28
    }
    ICON_DIV.style.top = selectionBoundingClientRect.bottom - parentBoundingClientRect.top - selectionHeightPlus28 + "px";
    ICON_DIV.style.left = mouseUpContent.clientX + DOCUMENT_ELM.scrollLeft - 12 + "px";
    ICON_DIV.addEventListener("click", requestMainApi, false);

    if (DOCUMENT_BODY.appendChild(ICON_DIV)) {
        isIconAdded = true;
    }
}

/**
 *
 *
 * @param mouseUpContent
 */
function displayBubble(mouseUpContent) {
    let selectionObj = window.getSelection();
    let selectionTextForCheck = selectionObj
        .toString()
        .replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ")
        .trim();

    if (!selectionTextForCheck || selectionTextForCheck.includes(" ")) {
        return;
    }

    if (!selectionTextForCheck.endsWith("day")) {
        selectionTextForCheck = selectionTextForCheck.toLowerCase();
    }
    selectionText = selectionTextForCheck;
    selectionClientX = mouseUpContent.clientX;
    selectionBoundingClientRect = selectionObj.getRangeAt(0).getBoundingClientRect();
    requestMainApi(null);
}

/**
 * Fired when icon clicked, request by main API
 *
 * @param clickContent
 */
function requestMainApi(clickContent) {
    if (isIconAdded && DOCUMENT_BODY.removeChild(ICON_DIV)) {
        isIconAdded = false;
    }
    if (clickContent) {
        clickContent.stopPropagation();
        clickContent.preventDefault();
    }

    // Create a request variable and assign a new XMLHttpRequest object to it.
    let request = new XMLHttpRequest();
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', API_DOMAIN + '/v2/dictionaries/ldoce5/entries?limit=5&headword=' + selectionText, true);

    request.addEventListener("load", useLoadedMainApi, false);
    request.addEventListener("load", requestSynonymApi, false);

    request.send();

}

/**
 * Fired when API loaded first, display bubble
 */
function useLoadedMainApi() {
    // Begin accessing JSON data here
    const dataContent = analyzeMainApiJson(JSON.parse(this.response));
    bubbleDiv = document.createElement("div");
    bubbleDiv.classList.add("lmd", "lmd-bubble");
    bubbleDiv.width = FRAME_WIDTH + "px";
    bubbleDiv.height = FRAME_HEIGHT + "px";
    bubbleDiv.style.cssText += 'z-index: 999999999 !important;';
    bubbleDiv.style.position = "absolute";
    bubbleDiv.style.visibility = "visible";
    bubbleDiv.style.opacity = "0";

    // close btn
    let closeBtn = document.createElement("div");
    closeBtn.classList.add("lmd", "lmd-close-btn");
    closeBtn.addEventListener("click",
        () => {
            return void(DOCUMENT_BODY.removeChild(bubbleDiv) && (bubbleDiv = null))
        }, false);
    bubbleDiv.appendChild(closeBtn);

    let containerDiv = document.createElement("div");
    containerDiv.classList.add("lmd");
    containerDiv.style.minWidth = "200px";
    containerDiv.style.maxWidth = "400px";

    // headword
    let headwordDiv = document.createElement("div");
    headwordDiv.innerHTML = selectionText;
    headwordDiv.classList.add("lmd");
    headwordDiv.style.cssText += 'font-size: 30px !important;';
    headwordDiv.style.fontWeight = "bold";
    headwordDiv.style.color = "blue";
    containerDiv.appendChild(headwordDiv);
    let hr = document.createElement("hr");
    hr.style.margin = "1px";
    containerDiv.appendChild(hr);

    if (dataContent.length > 0) {
        for (let i = 0; i < dataContent.length; i++) {
            if ("partOfSpeech" in dataContent[i]) {
                let partOfSpeechDiv = document.createElement("div");
                partOfSpeechDiv.classList.add("lmd");
                let posStr = dataContent[i]["partOfSpeech"];
                partOfSpeechDiv.innerHTML = "- " + posStr.charAt(0).toUpperCase() + posStr.slice(1);
                if ("grammaticalInfo" in dataContent[i]) {
                    partOfSpeechDiv.innerHTML += " (" + dataContent[i]["grammaticalInfo"] + ")";
                }
                partOfSpeechDiv.style.fontStyle = "italic";
                partOfSpeechDiv.style.display = "inline-block";
                partOfSpeechDiv.style.paddingRight = "15px";

                containerDiv.appendChild(partOfSpeechDiv);
            }

            if ("audio" in dataContent[i]) {
                let audio = document.createElement("audio");
                audio.src = dataContent[i]["audio"];
                audio.classList.add("lmd");
                audio.preload = "auto";
                let audioBtnDiv = document.createElement("div");
                audioBtnDiv.style.display = "inline-block";
                audioBtnDiv.classList.add("lmd");
                audioBtnDiv.addEventListener("click", () => {
                    audio.play()
                }, false);

                let audioImgDiv = document.createElement("div");
                audioImgDiv.classList.add("lmd", "lmd-audio-img");
                audioBtnDiv.appendChild(audioImgDiv);

                containerDiv.appendChild(audioBtnDiv);
            }

            if ("ipa" in dataContent[i] && dataContent[i]["ipa"].trim() !== "") {
                let ipaDiv = document.createElement("div");
                ipaDiv.classList.add("lmd");
                ipaDiv.style.display = "inline-block";
                ipaDiv.innerHTML = dataContent[i]["ipa"];
                containerDiv.appendChild(ipaDiv);
            }

            if ("definition" in dataContent[i] && dataContent[i]["definition"].trim() !== "") {
                let definitionDiv = document.createElement("div");
                definitionDiv.classList.add("lmd");
                definitionDiv.innerHTML = dataContent[i]["definition"];
                definitionDiv.style.paddingLeft = "15px";
                definitionDiv.style.fontWeight = "bold";
                containerDiv.appendChild(definitionDiv);
            }

            if ("example" in dataContent[i]) {
                // audioBtn
                let exampleAudio = document.createElement("audio");
                exampleAudio.src = dataContent[i]["example"]["audio"];
                exampleAudio.classList.add("lmd");
                exampleAudio.preload = "auto";
                let exampleAudioBtnDiv = document.createElement("div");
                exampleAudioBtnDiv.style.display = "inline-block";
                exampleAudioBtnDiv.classList.add("lmd");
                exampleAudioBtnDiv.style.verticalAlign = "top";
                exampleAudioBtnDiv.style.paddingLeft = "15px";
                exampleAudioBtnDiv.onclick = function () {
                    exampleAudio.play();
                };

                let exampleAudioImgDiv = document.createElement("div");
                exampleAudioImgDiv.classList.add("lmd", "lmd-audio-img");
                exampleAudioBtnDiv.appendChild(exampleAudioImgDiv);
                containerDiv.appendChild(exampleAudioBtnDiv);

                // text
                let exampleText = document.createElement("div");
                exampleText.classList.add("lmd");
                exampleText.innerHTML = dataContent[i]["example"]["text"];
                exampleText.style.display = "inline-block";
                exampleText.style.color = "blue";
                exampleText.style.width = "360px";
                containerDiv.appendChild(exampleText);
            }

            let synonymsDiv = document.createElement("div");
            synonymsDiv.innerHTML = "Synonyms: ";
            synonymsDiv.classList.add("lmd");
            if ("partOfSpeech" in dataContent[i]) {
                synonymsDiv.classList.add(
                    "synonyms-" + dataContent[i]["partOfSpeech"].replace(/\s+/g, ""));
            }
            synonymsDiv.style.fontStyle = "italic";
            synonymsDiv.style.display = "inline-block";
            synonymsDiv.style.paddingLeft = "15px";
            synonymsDiv.style.color = "#6b6060";
            synonymsDiv.style.display = "none";
            containerDiv.appendChild(synonymsDiv);

            if ("synonym" in dataContent[i]) {
                let synonymDiv = document.createElement("div");
                synonymDiv.style.display = "inline-block";
                synonymDiv.innerHTML = dataContent[i]["synonym"];
                synonymsDiv.appendChild(synonymDiv);
                synonymsDiv.style.display = "";
            }

            let hr = document.createElement("hr");
            hr.style.margin = "1px";
            containerDiv.appendChild(hr);
        }
    } else {
        let notFoundDiv = document.createElement("div");
        notFoundDiv.classList.add("lmd");
        notFoundDiv.innerHTML = "Not Found";
        containerDiv.appendChild(notFoundDiv);
    }

    // footer
    let footerDiv = document.createElement("div");
    footerDiv.classList.add("lmd", "lmd-footer");
    footerDiv.style.paddingTop = "3px";

    // more
    let moreA = document.createElement("a");
    moreA.classList.add("lmd", "lmd-a");
    moreA.href = LMD_UTL + selectionText;
    moreA.innerHTML = "More >>";
    moreA.target = "_blank";
    moreA.style.cursor = "pointer";
    moreA.addEventListener("focus", (focusedContent) => {
        focusedContent.blur()
    }, false);
    footerDiv.appendChild(moreA);

    containerDiv.appendChild(footerDiv);
    bubbleDiv.appendChild(containerDiv);
    DOCUMENT_BODY.appendChild(bubbleDiv);
}

/**
 * Fired when main API loaded after 1st, request by synonym API
 */
function requestSynonymApi() {
    let synonymRequest = new XMLHttpRequest();
    synonymRequest.open('GET', API_DOMAIN + '/v2/dictionaries/ldoce5/entries?limit=5&synonyms=' + selectionText, true);
    synonymRequest.addEventListener("load", useLoadedSynonymApi, false);
    synonymRequest.addEventListener("load", decideBubblePosition, false);
    synonymRequest.send();
}

/**
 * Fired when synonym API loaded, update bubble
 */
function useLoadedSynonymApi() {
    const dataContent = analyzeSynonymApiJson(JSON.parse(this.response));
    for (let key in dataContent) {
        let synonymsPoses = document.getElementsByClassName(key);
        let existingSynonyms = [];
        if (synonymsPoses.length !== 0) {
            if (synonymsPoses[0].getElementsByTagName("div").length !== 0) {
                existingSynonyms = synonymsPoses[0].getElementsByTagName("div");
            }
            for (let i = 0; i < dataContent[key].length; i++) {
                if ("headword" in dataContent[key][i]) {
                    let synonymDiv = null;
                    console.log(existingSynonyms.length);
                    for (let j = 0; j < existingSynonyms.length; j++) {
                        if (existingSynonyms[j].innerText === dataContent[key][i]["headword"]) {
                            synonymDiv = existingSynonyms[j];
                        }
                    }
                    if (synonymDiv === null) {
                        if (i === 0 && existingSynonyms.length !== 0) {
                            synonymsPoses[0].innerHTML += ", ";
                        }
                        synonymDiv = document.createElement("div");
                        synonymDiv.style.display = "inline-block";
                        synonymDiv.innerHTML = dataContent[key][i]["headword"];
                    }
                    if ("definition" in dataContent[key][i]) {
                        synonymDiv.title = dataContent[key][i]["definition"];
                    }
                    synonymsPoses[0].appendChild(synonymDiv);
                    if (i < dataContent[key].length - 1) {
                        synonymsPoses[0].innerHTML += ", ";
                    }
                }
            }
            synonymsPoses[0].style.display = "";
        }
    }
}

/**
 * Fired when synonym API loaded, decide bubble position
 */
function decideBubblePosition() {
    // Horizontal position calculation and set
    let frameVerticalCenter = bubbleDiv.getBoundingClientRect().width / 2;
    let leftPosition = 0;
    let positionModifyClass = "";
    if (selectionClientX + frameVerticalCenter > DOCUMENT_BODY.clientWidth) {
        positionModifyClass = "right-";
        leftPosition = selectionBoundingClientRect.right - bubbleDiv.getBoundingClientRect().width;
    } else {
        if (frameVerticalCenter > selectionClientX) {
            leftPosition = selectionBoundingClientRect.left;
            positionModifyClass = "left-";
        } else {
            leftPosition = selectionClientX + DOCUMENT_ELM.scrollLeft - frameVerticalCenter;
        }
    }
    bubbleDiv.style.left = leftPosition + "px";

    // Vertical position calculation and set
    let topPosition = 0;
    const TOP_ADJUSTMENT_PX = 12;
    if (selectionBoundingClientRect.top < bubbleDiv.getBoundingClientRect().height + TOP_ADJUSTMENT_PX) {
        topPosition = DOCUMENT_ELM.scrollTop + selectionBoundingClientRect.bottom + TOP_ADJUSTMENT_PX;
        bubbleDiv.classList.add("lower-" + positionModifyClass + "arrow");
    } else {
        topPosition = DOCUMENT_ELM.scrollTop + selectionBoundingClientRect.top -
            (bubbleDiv.getBoundingClientRect().height + TOP_ADJUSTMENT_PX);
        bubbleDiv.classList.add("upper-" + positionModifyClass + "arrow");
    }
    bubbleDiv.style.top = topPosition + "px";

    // Display
    bubbleDiv.style.opacity = "1";
}

/**
 * Make main json
 *
 * @param responseJson
 * @returns {Array}
 */
function analyzeMainApiJson(responseJson) {
    let jsonAry = [];
    if (!"total" in responseJson || responseJson["total"] === 0) {
        return jsonAry;
    }
    for (let responseAryKey in responseJson["results"]) {
        const jsonObj = responseJson["results"][responseAryKey];

        if (selectionText !== jsonObj["headword"]) {
            continue;
        }

        let json = {};
        // HEADWORD
        json.headword = jsonObj["headword"];
        // PART OF SPEECH
        if ("part_of_speech" in jsonObj) {
            json.partOfSpeech = jsonObj["part_of_speech"];
        }
        // IPA AUDIO
        if ("pronunciations" in jsonObj) {
            const pronunciations = jsonObj["pronunciations"];
            // if there is only one element and more than 2 audios, ipa is common but pro is diff
            if (pronunciations.length === 1) {
                for (let audioIndex in pronunciations[0]["audio"]) {
                    if (pronunciations[0]["audio"][audioIndex]["lang"] !== "American English") {
                        continue;
                    }
                    json.ipa = pronunciations[0]["ipa"];
                    json.audio = API_DOMAIN + pronunciations[0]["audio"][audioIndex]["url"];
                }
            } else {
                // if there is two element, each has own ipa
                for (let pronunciationsIndex in pronunciations) {
                    if (!"lang" in pronunciations[pronunciationsIndex]
                        || pronunciations[pronunciationsIndex]["lang"] !== "American English") {
                        continue;
                    }
                    if ("ipa" in pronunciations[pronunciationsIndex]) {
                        json.ipa = pronunciations[pronunciationsIndex]["ipa"];
                        if ("audio" in pronunciations[pronunciationsIndex]) {
                            for (let audio in pronunciations[pronunciationsIndex]["audio"]) {
                                json.audio = API_DOMAIN + pronunciations[pronunciationsIndex]["audio"][audio]["url"];
                            }
                        }
                    }
                }
            }
        }

        // SENSES
        if ("senses" in jsonObj && jsonObj["senses"]) {
            for (let key in jsonObj["senses"][0]) {
                if (jsonObj["senses"][0][key] instanceof Array) {
                    if (jsonObj["senses"][0][key][0] instanceof Object) {
                        if ("text" in jsonObj["senses"][0][key][0]) {
                            // EXAMPLE
                            json.example = {};
                            json.example.text = EXAMPLE_PREFIX + jsonObj["senses"][0][key][0]["text"];
                            if ("audio" in jsonObj["senses"][0][key][0]) {
                                json.example.audio = API_DOMAIN + jsonObj["senses"][0][key][0]["audio"][0]["url"];
                            }

                        }
                    } else {
                        // DEFINITION
                        json.definition = jsonObj["senses"][0][key][0];
                    }
                } else if (jsonObj["senses"][0][key] instanceof Object
                    && "type" in jsonObj["senses"][0][key]) {
                    // GRAMMATICAL INFO
                    json.grammaticalInfo = jsonObj["senses"][0][key]["type"];
                } else if ("synonym" in jsonObj["senses"][0]) {
                    // SYNONYM
                    json.synonym = jsonObj["senses"][0][key];
                }
            }
        }

        // URL
        json.url = "https://www.ldoceonline.com/dictionary/" + json.headword;
        jsonAry.push(json);
    }

    console.log(jsonAry);
    return jsonAry;
}

/**
 * Make synonym json
 *
 * @param responseJson
 * @returns {Array}
 */
function analyzeSynonymApiJson(responseJson) {
    let jsonObj = {};
    if (!"total" in responseJson || responseJson["total"] === 0) {
        return jsonObj;
    }
    for (let responseAryKey in responseJson["results"]) {
        const SYNONYM_JSON = responseJson["results"][responseAryKey];
        if (!("part_of_speech" in SYNONYM_JSON)
            || !("headword" in SYNONYM_JSON)
            || selectionText === SYNONYM_JSON["headword"]) {
            continue;
        }
        const SYNONYM_CLASS_STR = "synonyms-" + SYNONYM_JSON["part_of_speech"].replace(/\s+/g, "");
        ;
        if (!(SYNONYM_CLASS_STR in jsonObj)) {
            jsonObj[SYNONYM_CLASS_STR] = [];
        }
        let synonymJson = {
            "headword": SYNONYM_JSON["headword"],
        };

        // SENSES
        if ("senses" in SYNONYM_JSON && SYNONYM_JSON["senses"] instanceof Array) {
            for (let key in SYNONYM_JSON["senses"][0]) {
                if (SYNONYM_JSON["senses"][0][key] instanceof Array) {
                    if (!(SYNONYM_JSON["senses"][0][key][0] instanceof Object)) {
                        // DEFINITION
                        synonymJson[key] = SYNONYM_JSON["senses"][0][key][0];
                    }
                }
            }
        }

        jsonObj[SYNONYM_CLASS_STR].push(synonymJson);
    }

    console.log(jsonObj);
    return jsonObj;
}
