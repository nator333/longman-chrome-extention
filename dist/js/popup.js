const lmdUtl = "https://www.ldoceonline.com/dictionary/";
document.getElementById("lmd-search-btn").addEventListener("click", search);
function search() {
    chrome.tabs.create({
            active: true,
            url: lmdUtl + document.getElementById("lmd-text-input").value.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ").trim()
        }
    );
}
