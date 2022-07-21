continueButton = document.getElementById("ContinueButton"); 
continueButton.addEventListener("click",getInputs);

function getInputs(){
  let inputs = document.getElementsByTagName("input")
  let username = inputs[0].value;
  let URL = inputs[1].value;
  let nickname = inputs[2].value;

  if (username == null || username == '' || URL == null || URL == '' || nickname == null || nickname == '') {
    alert("Please fill out all required fields.");
    return false;
  }
  
  let video = {nickname: nickname, url: URL, userid: username};
    
  sendPostRequest('/videoData',JSON.stringify(video)).then(function() {
    sessionStorage.setItem("vidtitle", nickname);
    window.location = "/preview.html"
  }).catch(function(error) {
    console.log("Error Occured:", error)
    window.location = "/errorpage.html"
    sessionStorage.setItem("vidtitle", error);
  });
}

async function sendPostRequest(url,data) {
  let response = await fetch(url, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: data });
  if (response.ok) {
    let data = await response.text();
    console.log("Got here!");
    return data;
  } else {
    throw Error(response.status + " - " + await response.text());
  }
} 
