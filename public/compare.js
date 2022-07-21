let videoElmts = document.getElementsByClassName("tiktokDiv");
let reloadButtons = document.getElementsByClassName("reload");
let heartButtons = document.querySelectorAll("div.heart");
let nextButton = document.getElementById("nextButton");
let vidTitles = document.getElementsByClassName("vidTitle");

nextButton.disabled = true; 
nextButton.classList.replace("enabledButton","disabledButton")

nextButton.addEventListener("click", function() {
  sendPostRequest('/insertPref',pref).then(function(response){
    if (response === 'continue') {
      //console.log("CAN CONTINUE")
      window.location = '/compare.html'
    } else if (response === 'pick winner') {
      //console.log("Time to pick the winner")
      window.location = "/winner.html"
    }
  }).catch(function(error){
    console.log("Error:",error)
  })
})

let vidData = []
let pref = {}

for (let i=0; i<2; i++) {
  let reload = reloadButtons[i]; 
  //let heart = heartButtons[i];
  reload.addEventListener("click",function() { reloadVideo(videoElmts[i]) });
  heartButtons[i].classList.add("unloved");
  heartButtons[i].disabled = true; 
  heartButtons[i].style.cursor = "not-allowed"
  reload.disabled = true; 
  reload.style.cursor = "not-allowed"
} // for loop

sendGetRequest('getTwoVideos').then(function(data){
  //console.log(data[0].url)
  for (let i=0; i<2; i++) {
    addVideo(data[i].url,videoElmts[i]).then(function() {
      heartButtons[i].disabled = false;
      reloadButtons[i].disabled = false;
      heartButtons[i].style.cursor = 'default';
      reloadButtons[i].style.cursor = "default";
    })
    vidTitles[i].textContent = data[i].nickname;
  }
  loadTheVideos();
  vidData = data;
}).catch(function(error){
  console.log("Error:", error)
})

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

async function sendPostRequest(url,data) {
  params = {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data) };
  console.log("about to send post request");
  
  let response = await fetch(url,params);
  if (response.ok) {
    let data = await response.text();
    return data;
  } else {
    throw Error(response.status);
  }
}

function fillHeart(elem) {
  elem.classList.remove("unloved")
  elem.classList.add("loved")
  const toBeReplaced = elem.children[0]
  const filledHeart = document.createElement("i")
  filledHeart.classList.add("fas","fa-heart")
  elem.replaceChild(filledHeart,toBeReplaced)
}

function unfillHeart(elem) {
  elem.classList.remove("loved")
  elem.classList.add("unloved")
  const toBeReplaced = elem.children[0]
  const filledHeart = document.createElement("i")
  filledHeart.classList.add("far","fa-heart")
  elem.replaceChild(filledHeart,toBeReplaced)
}

function toggleHeart(elem, prevElem) {
  fillHeart(elem);
  prevElem = document.getElementById(prevElem);
  unfillHeart(prevElem);
  vidObj = vidData.filter(vid => {
    return vid.url === elem.parentElement.parentElement.children[0].children[0].children[0].cite;
  });
  vidObjPrev = vidData.filter(vid => {
    return vid.url === prevElem.parentElement.parentElement.children[0].children[0].children[0].cite;
  });
  pref = {better: vidObj[0].rowIdNum, worse: vidObjPrev[0].rowIdNum}
  nextButton.disabled = false; 
  nextButton.classList.replace("disabledButton","enabledButton");
  console.log(pref)
}