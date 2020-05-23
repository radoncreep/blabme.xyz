
let link = document.getElementById('link-input');

console.log(link);

let linkBtn = document.getElementById('select-link');

linkBtn.addEventListener('click', getLink);

function getLink(e) {
    e.preventDefault();
    
    link.select();
    link.setSelectionRange(0, 99999);

    document.execCommand("copy");

    alert("Click 'ok' to copy your profile link " + link.value);
};

// var copyText = document.getElementById("myInput");

// /* Select the text field */
// copyText.select();
// copyText.setSelectionRange(0, 99999); /*For mobile devices*/

// /* Copy the text inside the text field */
// document.execCommand("copy");

// /* Alert the copied text */
// alert("Copied the text: " + copyText.value);

//referrence
// https://www.w3schools.com/howto/howto_js_copy_clipboard.asp