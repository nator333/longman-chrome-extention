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
        bubbleDiv = document.createElement("iframe");
        bubbleDiv.src = lmdUtl + document.getElementById("lmd-text-input").value.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ").trim();

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

