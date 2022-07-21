// This viewer takes a TikTok video URL and displays it in a nice magenta box, and gives it a reload button in case you want to watch it again. 

// for example, these are hardcoded
//const example = 'https://www.tiktok.com/@cheyennebaker1/video/7088856562982423854';

// grab elements we'll use 
// these are global! 
let reloadButton = document.getElementById("reload");
let continueButton = document.getElementById("continue")
let divElmt = document.getElementById("tiktokDiv");
let videoTitle = document.getElementById("videoTitle");

let storedVideotitle = sessionStorage.getItem("vidtitle"); // placeholder name for now

let text = videoTitle.textContent;
text = text.replace("Video Title", storedVideotitle);
videoTitle.textContent = text;

// set up button
reloadButton.addEventListener("click", reloadVideo);
continueButton.addEventListener("click", confirmation);

// add the blockquote element that TikTok wants to load the video into
//addVideo(example,divElmt);

// on start-up, load the videos
//loadTheVideos();

getMostRecentVideo()

async function getMostRecentVideo() {
  sendGetRequest('/getMostRecent').then(function(data) {
    //data = JSON.parse(data)
    console.log(data)
    addVideo(data.url, divElmt)
    loadTheVideos()
  })
}

// Add the blockquote element that tiktok will load the video into
async function addVideo(tiktokurl, divElmt) {

  let videoNumber = tiktokurl.split("video/")[1];

  let block = document.createElement('blockquote');
  block.className = "tiktok-embed";
  block.cite = tiktokurl;
  // have to be formal for attribute with dashes
  block.setAttribute("data-video-id", videoNumber);

  block.style = "width: 325px; height: 563px;"

  //block.style = "width: 231px; height: 400px;"

  let section = document.createElement('section');
  block.appendChild(section);

  divElmt.appendChild(block);
}

// Ye olde JSONP trick; to run the script, attach it to the body
function loadTheVideos() {
  body = document.body;
  script = newTikTokScript();
  body.appendChild(script);
}

// makes a script node which loads the TikTok embed script
function newTikTokScript() {
  let script = document.createElement("script");
  script.src = "https://www.tiktok.com/embed.js"
  script.id = "tiktokScript"
  return script;
}

// the reload button; takes out the blockquote and the scripts, and puts it all back in again.
// the browser thinks it's a new video and reloads it
async function reloadVideo() {
  sendGetRequest('/getMostRecent').then(function(data) {
    // get the two blockquotes
    let blockquotes
      = document.getElementsByClassName("tiktok-embed");

    // and remove the indicated one
    block = blockquotes[0];
    console.log("block", block);
    let parent = block.parentNode;
    parent.removeChild(block);

    // remove both the script we put in and the
    // one tiktok adds in
    let script1 = document.getElementById("tiktokScript");
    let script2 = script.nextElementSibling;

    let body = document.body;
    body.removeChild(script1);
    body.removeChild(script2);

    addVideo(data.url, divElmt);
    loadTheVideos();
  })
}

function confirmation() {
  window.location = "/myVideos.html"
}

async function sendGetRequest(url) {
  let response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (response.ok) {
    let data = await response.json();
    console.log("Got here!");
    return data;
  } else {
    throw Error(response.status);
  }
}

