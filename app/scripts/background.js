'use strict';

var Api = (function() {
  function save_views(views, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/api/create', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4 || xhr.status < 200) {
        return;
      }
      callback && callback();
    };
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send('data=' + encodeURIComponent(JSON.stringify(views)));
  }
  return {
    save_views: save_views
  };
})();

var db = [];
var max_length = 50;

function upload_data() {
  var copy_db = db.slice();
  db = [];
  Api.save_views(copy_db);
}

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    db.push(request);
    if (db.length >= max_length) {
      upload_data();
    }
    sendResponse(200);
  });

setInterval(function() {
  if (db.length) {
    upload_data();
  }
}, 1000 * 60 * 10);
