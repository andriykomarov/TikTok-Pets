const success = document.getElementById("vidTitle");

let videotitle = sessionStorage.getItem("vidtitle"); // placeholder name for now
console.log(videotitle);

let text = success.textContent;
text = text.replace("videotitle", videotitle);
success.textContent = text; 

continueButton = document.getElementById("formButton"); 
continueButton.addEventListener("click", changePage);

function changePage() {
  window.location = "/tiktokpets.html";
}