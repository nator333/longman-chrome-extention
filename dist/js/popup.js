const lmdUtl = "https://www.ldoceonline.com/dictionary/";
document.getElementById("lmd-search-btn").addEventListener("click", search);
document.getElementById("lmd-text-input").addEventListener("keypress", enterSearch);

function search() {
    chrome.tabs.create({
            active: true,
            url: lmdUtl + document.getElementById("lmd-text-input").value.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ").trim()
        }
    );
}

function enterSearch(event){
    if (event.defaultPrevented) {
        return;
    }

    if (event.key === "Enter") {
        search();
    }
}