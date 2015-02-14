'use strict';

var last_action_ts = +new Date();
var interval = 1000 * 30;
var no_action_timer;

var Message = (function() {
  var view_obj;
  function create_view_object() {
    console.log('active view');
    if (view_obj) {
      return;
    }

    view_obj = {
      title: document.title,
      url: location.href,
      start_ts: +new Date()
    };
  }
  function close_view_object() {
    console.log('close view');
    view_obj.duration = last_action_ts - view_obj.start_ts;
    send_message(function() {
      view_obj = null;
      clearTimeout(no_action_timer);
      no_action_timer = null;
    });
  }
  function send_message(callback) {
    chrome.runtime.sendMessage(view_obj, function(response) {
      console.log(200);
      callback && callback();
    });
  }
  return {
    active_view: create_view_object,
    close_view: close_view_object,
    send_message: send_message
  };
})();

no_action_timer = setTimeout(function() {
  Message.close_view();
}, interval);

var has_action = function() {
  var now = +new Date();
  if (now - last_action_ts > 499 || !no_action_timer) {
    Message.active_view();
    if (no_action_timer) {
      clearTimeout(no_action_timer);
    }
    no_action_timer = setTimeout(function() {
      Message.close_view();
    }, interval);
    last_action_ts = now;
  }
};

window.addEventListener('mousemove', has_action);
window.addEventListener('keydown', has_action);
window.addEventListener('scroll', has_action);
window.addEventListener('focus', function() {
  Message.active_view();
});
window.addEventListener('beforeunload', function() {
  Message.close_view();
});

Message.active_view();
