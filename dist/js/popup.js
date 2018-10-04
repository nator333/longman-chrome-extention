const frameWidth = 450;
const frameHeight = 300;
const apiDomain = "https://api.pearson.com";
const lmdUtl = "https://www.ldoceonline.com/dictionary/";
const examplePrefix = "ex) ";
let documentBody = document.body;
let documentElm = document.documentElement;
let iconDiv = document.createElement("div");
let dictIconDiv = document.createElement("div");
let isDicDivAdded = false;
let bubbleDiv = void 0;

dictIconDiv.classList.add("cambridge-dict-icon");
iconDiv.classList.add("cambridge-dict");
iconDiv.appendChild(dictIconDiv);

document.getElementById("lmd-search-btn").addEventListener(
    "click",
    function () {
        let selectionText = document.getElementById("lmd-text-input").value.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ").trim();
        if (!selectionText.endsWith("day")) {
            selectionText = selectionText.toLowerCase();
        }
        // Create a request variable and assign a new XMLHttpRequest object to it.
        let request = new XMLHttpRequest();
        // Open a new connection, using the GET request on the URL endpoint
        request.open('GET', apiDomain + '/v2/dictionaries/ldoce5/entries?limit=5&headword=' + selectionText, true);

        request.onload = function () {
            // Begin accessing JSON data here
            const dataContent = analyzeJson(JSON.parse(this.response), selectionText);
            bubbleDiv = document.createElement("div");
            bubbleDiv.classList.add("lmd", "long-man-dict-bubble");
            bubbleDiv.width = frameWidth + "px";
            bubbleDiv.height = frameHeight + "px";
            bubbleDiv.style.cssText += 'z-index: 999999999 !important;';
            bubbleDiv.style.position = "absolute";
            bubbleDiv.style.visibility = "visible";
            bubbleDiv.style.opacity = "0";

            // close btn
            let closeBtn = document.createElement("div");
            closeBtn.classList.add("lmd", "lmd-close-btn");
            closeBtn.onclick = function () {
                return void(documentBody.removeChild(bubbleDiv) && (bubbleDiv = null));
            };
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
            containerDiv.appendChild(headwordDiv);

            if (dataContent.length > 0) {
                for (let i = 0; i < dataContent.length; i++) {
                    if ("partOfSpeech" in dataContent[i]) {
                        let partOfSpeechDiv = document.createElement("div");
                        partOfSpeechDiv.classList.add("lmd");
                        partOfSpeechDiv.innerHTML = "- " + dataContent[i]["partOfSpeech"];
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
                        audioBtnDiv.onclick = function () {
                            audio.play();
                        };

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
                }
            } else {
                let notFoundDiv = document.createElement("div");
                notFoundDiv.classList.add("lmd");
                notFoundDiv.innerHTML = "Not Found";
                containerDiv.appendChild(notFoundDiv);
            }

            // more
            let moreA = document.createElement("a");
            moreA.classList.add("lmd", "lmd-a");
            moreA.href = lmdUtl + selectionText;
            moreA.innerHTML = "More";
            moreA.target = "_blank";
            moreA.style.cursor = "pointer";
            moreA.onfocus = function () {
                this.blur();
            };
            containerDiv.appendChild(moreA);

            bubbleDiv.appendChild(containerDiv);
            documentBody.appendChild(bubbleDiv);

            // Display
            bubbleDiv.style.opacity = "1";
        };
        request.send();


        // documentBody.onmouseup = function (content) {
        //     if (bubbleDiv && !content.target["classList"].contains('lmd')) return void(documentBody.removeChild(bubbleDiv) && (bubbleDiv = null));
        //     setTimeout(function () {
        //         let selectionBoundingClientRect = void 0;
        //         let selectionObj = window.getSelection();
        //         let selectionText = selectionObj.toString().replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ").trim();
        //         if (!selectionText.endsWith("day")) {
        //             selectionText = selectionText.toLowerCase();
        //         }
        //         let parentBoundingClientRect = document.body.parentNode.getBoundingClientRect();
        //         let selectionHeightPlus28 = -1;
        //
        //         if (isDicDivAdded) {
        //             if (documentBody.removeChild(iconDiv)) {
        //                 isDicDivAdded = false;
        //             }
        //         }
        //
        //         if (selectionText) {
        //             if (content.target !== iconDiv) {
        //                 if (!selectionText.includes(" ")) {
        //                     selectionBoundingClientRect = selectionObj.getRangeAt(0).getBoundingClientRect();
        //                     if (Math.abs(content.clientY - selectionBoundingClientRect.top) >
        //                         selectionBoundingClientRect.bottom - selectionBoundingClientRect.clientY) {
        //                         selectionHeightPlus28 = selectionBoundingClientRect.height + 28
        //                     }
        //                     iconDiv.style.top = selectionBoundingClientRect.bottom - parentBoundingClientRect.top - selectionHeightPlus28 + "px";
        //                     iconDiv.style.left = content.clientX + documentElm.scrollLeft - 12 + "px";
        //                     iconDiv.onclick =
        //
        //                     if (documentBody.appendChild(iconDiv)) {
        //                         isDicDivAdded = true;
        //                     }
        //                 }
        //             }
        //         }
        //     })
        // };
    }
);


function analyzeJson(responseJson, selectionText) {
    let jsonAry = [];
    if (!"total" in responseJson || responseJson["total"] === 0) {
        return jsonAry;
    }
    for (let responseAryKey in responseJson["results"]) {
        console.log(responseJson["results"][responseAryKey]);
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
                    json.audio = apiDomain + pronunciations[0]["audio"][audioIndex]["url"];
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
                                json.audio = apiDomain + pronunciations[pronunciationsIndex]["audio"][audio]["url"];
                            }
                        }
                    }
                }
            }
        }

        // Senses
        for (let key in jsonObj["senses"][0]) {
            if (jsonObj["senses"][0][key] instanceof Array) {
                if (jsonObj["senses"][0][key][0] instanceof Object) {
                    if ("text" in jsonObj["senses"][0][key][0]) {
                        // EXAMPLE
                        json.example = {};
                        json.example.text = examplePrefix + jsonObj["senses"][0][key][0]["text"];
                        if ("audio" in jsonObj["senses"][0][key][0]) {
                            json.example.audio = apiDomain + jsonObj["senses"][0][key][0]["audio"][0]["url"];
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
        // Url
        json.url = "https://www.ldoceonline.com/dictionary/" + json.headword;
        jsonAry.push(json);
    }

    console.log(jsonAry);
    return jsonAry;
}

