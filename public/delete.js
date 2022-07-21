// nicknames = document.getElementsByClassName("textArea").item;
// nickname = nicknames.innerText;//[parseInt(this.id)];
// console.log("TEST", nicknames);

textFields = document.getElementsByClassName("textArea")
// for(let i = 0; i < textFields.length; i++)
//   {
//     console.log("TET", textFields[i].textcontent);
//   }

deleteAction = document.getElementsByClassName('deleteButtons');

for (var i = 0; i < deleteAction.length; i++) {
  deleteAction[i].addEventListener("click", removeVideo);
}

function removeVideo() {
  sendPostRequest('/deleteVideoData', JSON.stringify(nickname)).then(function(data) {
    sessionStorage.setItem("vidtitle", data);
  }).catch(function(error) {
    console.log("Error Occured:", error);
    window.location = "/errorpage.html";
    sessionStorage.setItem("vidtitle", error);
  });
}

async function sendPostRequest(url, data) {
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
