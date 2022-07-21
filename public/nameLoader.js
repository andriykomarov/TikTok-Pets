let textFields = document.getElementsByClassName("textArea")
let playButton = document.getElementById("playGame")
let addNew = document.getElementById("addNew")
playButton.disabled = true;
addNew.disabled = false;

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

async function sendDeleteRequest(url, data) {
  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data
  });
  if (response.ok) {
    console.log("DELETED")
  } else {
    throw Error(response.status);
  }
}

sendGetRequest('/getList').then(function(data) {
  console.log("LOG: ", data)
  for (let i = 0; i < data.length; i++) {
    textFields[i].textContent = data[i].nickname
    if (textFields[i].textContent != "") {
      textFields[i].style.border = "2px solid rgba(186,186,186,255)";
    }
    textFields[i].nextElementSibling.addEventListener("click", function() {
      myFunc(textFields[i].textContent)
    })
  }

  if (data.length == 8) {
    playButton.disabled = false;
    addNew.disabled = true;
    playButton.style.opacity = 1;
    addNew.style.opacity = 0.5;
  }
})

// console.log("textFieldsZZ", textFields)
// console.log("The next sibling of this is: ", textFields[0].nextElementSibling)

function myFunc(nickname) {
  console.log("Clicked")
  sendDeleteRequest('/deleteVid', JSON.stringify({ nickname: nickname })).then(function(data) {
    //console.log(data)
    //console.log("TEST")
    window.location = "/myVideos.html"
  }).catch(function(error) {
    console.log("ERROR OCCURED: ", error)
  })
}

playButton.addEventListener("click", function() {
  window.location = '/compare.html';
});
