const FRAME_WIDTH = 450;
const FRAME_HEIGHT = 300;
const API_DOMAIN = "https://api.pearson.com";
const LMD_UTL = "https://www.ldoceonline.com/dictionary/";
const EXAMPLE_PREFIX = "ex) ";
const DOCUMENT_BODY = document.body;
const DOCUMENT_ELM = document.documentElement;
const ICON_DIV = document.createElement("div");
const DICT_ICON_IMAGE_DIV = document.createElement("div");

let isDicDivAdded = false;
let bubbleDiv = void 0;
let selectionText = "";
let selectedClientX = 0;
let selectionBoundingClientRect = void 0;

ICON_DIV.classList.add("cambridge-dict");
DICT_ICON_IMAGE_DIV.classList.add("cambridge-dict-icon");
ICON_DIV.appendChild(DICT_ICON_IMAGE_DIV);

DOCUMENT_BODY.addEventListener("mouseup", somethingSelected, false);

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

    setTimeout(() => {
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
        let parentBoundingClientRect = DOCUMENT_BODY.parentNode.getBoundingClientRect();

        if (isDicDivAdded && DOCUMENT_BODY.removeChild(ICON_DIV)) {
            isDicDivAdded = false;
        }

        if (mouseUpContent.target === ICON_DIV) {
            return
        }

        selectedClientX = mouseUpContent.clientX;
        selectionBoundingClientRect = selectionObj.getRangeAt(0).getBoundingClientRect();
        let selectionHeightPlus28 = -1;
        if (Math.abs(mouseUpContent.clientY - selectionBoundingClientRect.top) >
            selectionBoundingClientRect.bottom - selectionBoundingClientRect.clientY) {
            selectionHeightPlus28 = selectionBoundingClientRect.height + 28
        }
        ICON_DIV.style.top = selectionBoundingClientRect.bottom - parentBoundingClientRect.top - selectionHeightPlus28 + "px";
        ICON_DIV.style.left = mouseUpContent.clientX + DOCUMENT_ELM.scrollLeft - 12 + "px";
        ICON_DIV.addEventListener("click", iconClicked, false);

        if (DOCUMENT_BODY.appendChild(ICON_DIV)) {
            isDicDivAdded = true;
        }

    })
}

/**
 * Fired when icon clicked, request by main API
 *
 * @param clickContent
 */
function iconClicked(clickContent) {
    if (DOCUMENT_BODY.removeChild(ICON_DIV)) {
        isDicDivAdded = false;
    }
    clickContent.stopPropagation();
    clickContent.preventDefault();

    // Create a request variable and assign a new XMLHttpRequest object to it.
    let request = new XMLHttpRequest();
    // Open a new connection, using the GET request on the URL endpoint
    request.open('GET', API_DOMAIN + '/v2/dictionaries/ldoce5/entries?limit=5&headword=' + selectionText, true);

    request.addEventListener("load", mainApiLoaded_1, false);
    request.addEventListener("load", mainApiLoaded_2, false);

    request.send();

}

/**
 * Fired when API loaded first, display bubble
 */
function mainApiLoaded_1() {
    // Begin accessing JSON data here
    const dataContent = analyzeMainApiJson(JSON.parse(this.response));
    bubbleDiv = document.createElement("div");
    bubbleDiv.classList.add("lmd", "long-man-dict-bubble");
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
    headwordDiv.style.fontWeight = "bold";
    headwordDiv.style.fontSize = "x-large";
    headwordDiv.style.marginBottom = "8px";
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
                synonymsDiv.classList.add("synonyms-" + dataContent[i]["partOfSpeech"]);
            }
            synonymsDiv.style.fontStyle = "italic";
            synonymsDiv.style.display = "inline-block";
            synonymsDiv.style.paddingLeft = "15px";
            synonymsDiv.style.color = "#6b6060";
            synonymsDiv.style.display = "none";
            containerDiv.appendChild(synonymsDiv);

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
    moreA.innerHTML = "More";
    moreA.target = "_blank";
    moreA.style.cursor = "pointer";
    moreA.addEventListener("focus", () => {
        this.blur()
    }, false);
    footerDiv.appendChild(moreA);

    containerDiv.appendChild(footerDiv);
    bubbleDiv.appendChild(containerDiv);
    DOCUMENT_BODY.appendChild(bubbleDiv);

    // Horizontal position calculation and set
    let frameVerticalCenter = bubbleDiv.getBoundingClientRect().width / 2;
    let leftPosition = 0;
    if (selectedClientX + frameVerticalCenter > DOCUMENT_BODY.clientWidth) {
        leftPosition = selectionBoundingClientRect.right - bubbleDiv.getBoundingClientRect().width;
    } else {
        if (frameVerticalCenter > selectedClientX) {
            leftPosition = selectionBoundingClientRect.left;
            bubbleDiv.classList.add("left-arrow");
        } else {
            leftPosition = selectedClientX + DOCUMENT_ELM.scrollLeft - frameVerticalCenter;
            bubbleDiv.classList.add("center-arrow");
        }
    }
    bubbleDiv.style.left = leftPosition + "px";

    // Vertical position calculation and set
    let topPosition = 0;
    if (selectionBoundingClientRect.top < bubbleDiv.getBoundingClientRect().height + 10) {
        bubbleDiv.classList.add("lower-arrow");
        topPosition = DOCUMENT_ELM.scrollTop + selectionBoundingClientRect.bottom + 10;
    } else {
        bubbleDiv.classList.add("upper-arrow");
        topPosition = DOCUMENT_ELM.scrollTop + selectionBoundingClientRect.top - (bubbleDiv.getBoundingClientRect().height + 10);
    }
    bubbleDiv.style.top = topPosition + "px";

}

/**
 * Fired when main API loaded after 1st, request by synonym API
 */
function mainApiLoaded_2() {
    let synonymRequest = new XMLHttpRequest();
    synonymRequest.open('GET', API_DOMAIN + '/v2/dictionaries/ldoce5/entries?limit=5&synonyms=' + selectionText, true);
    synonymRequest.addEventListener("load", synonymApiLoaded, false);
    synonymRequest.send();
}

/**
 * Fired when synonym API loaded, update bubble
 */
function synonymApiLoaded() {
    const dataContent = analyzeSynonymApiJson(JSON.parse(this.response));
    for (let key in dataContent) {
        let synonymsPoses = document.getElementsByClassName(key);
        if (synonymsPoses) {
            synonymsPoses[0].innerHTML +=  dataContent[key];
            synonymsPoses[0].style.display = "";
        }
    }

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
                    if (!"lang" in pronunciations[pronunciationsIndex] || pronunciations[pronunciationsIndex]["lang"] !== "American English") {
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
            } else if (jsonObj["senses"][0][key] instanceof Object) {
                // GRAMMATICAL INFO
                json.grammaticalInfo = jsonObj["senses"][0][key]["type"];
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
        if (!"part_of_speech" in SYNONYM_JSON) {
            continue;
        }
        const SYNONYM_CLASS_STR = "synonyms-" + SYNONYM_JSON["part_of_speech"];
        if ("SYNONYM_CLASS_STR" in jsonObj) {
            let existingPos = jsonObj[SYNONYM_CLASS_STR];
            jsonObj[SYNONYM_CLASS_STR] = existingPos + ", " + SYNONYM_JSON["headword"];
        } else {
            jsonObj[SYNONYM_CLASS_STR] = SYNONYM_JSON["headword"];
        }
    }

    console.log(jsonObj);
    return jsonObj;
}
