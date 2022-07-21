// when this page is opened, get the most recently added video and show it.
// function is defined in video.js
let divElmt = document.getElementById("tiktokDiv");
let reloadButton = document.getElementById("reload");
let vidTitles = document.getElementsByClassName("vidTitle");
// set up button to reload video in "tiktokDiv"
reloadButton.addEventListener("click",function () {
  reloadVideo(tiktokDiv);
});



// always shows the same hard-coded video.  You'll need to get the server to 
// compute the winner, by sending a 
// GET request to /getWinner,
// and send the result back in the HTTP response.

showWinningVideo()

function showWinningVideo() {
  
  sendGetRequest('/getWinner').then(function(data){
    console.log(data)
    let winningUrl = data.url
    let vidName = data.nickname
    addVideo(winningUrl, divElmt);
    loadTheVideos();
    vidTitles[0].textContent = vidName;
  }).catch(function(error){
    console.log("ERROR", error)
  })
}

async function sendGetRequest(url) {
  params = {
    method: 'GET', 
     };
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.json();
    return data;
  } else {
    throw Error(response.status);
  }
}

