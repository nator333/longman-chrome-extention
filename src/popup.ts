const lmdUtl: string = "https://www.ldoceonline.com/dictionary/";

document.getElementById("lmd-search-btn")?.addEventListener("click", search);
document.getElementById("lmd-text-input")?.addEventListener("keypress", enterSearch);

function search(): void {
    const textInput = document.getElementById("lmd-text-input") as HTMLInputElement;
    if (!textInput) return;
    
    const searchTerm: string = textInput.value
        .replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ")
        .trim();
    
    chrome.tabs.create({
        active: true,
        url: lmdUtl + searchTerm
    });
}

function enterSearch(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
        return;
    }

    if (event.key === "Enter") {
        search();
    }
}