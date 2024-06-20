// #############################################
// ###### PHASE 2: Refactor file ################
// ### 사용되는 함수를 다른 파일로 분리 ##########
// ### 목적에 맞는 함수 관리를 용이하게 하기 위함##
// #############################################

var ws = new WebSocket("ws://localhost:8000/ws");
var url = window.location.href;
var friend = url.split("/")[4];
$("#friend_name").text(friend);
$(document).ready(function () {
  $.getJSON("/current_user", function (sender) {
    $.getJSON("/getroom", { user1: sender, user2: friend }, function (data) {
      if (data) {
        get_chats({ header_id: data.id });
      }
    });
  });
  ws.onmessage = function (event) {
    var msg = JSON.parse(event.data);
    var text = msg.content;
    var time = msg.sent_at;
    var msgSender = msg.sender_name;
    var header_id = msg.header_id;

    $.getJSON("/current_user", function (sender) {
      $.getJSON("/getroom", { user1: sender, user2: friend }, function (data) {
        console.log(header_id + "   " + data.id);
        if (data.id != header_id) {
          return;
        }

        if (msgSender != sender) {
          $("#chat_box").find(".chatting").append("<div><div class='receiver'>" + sender + "</div>" + "<div class='opsChat'>" +
            "<div class='op chat'>" + text.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div><div class='timeLeft'>" + time + "</div></div></div>");
        }
        $(".chatting").scrollTop($(".chatting")[0].scrollHeight);
      });
    });
  };

  $("#text_box").on("keydown", function (event) {
    if (event.keyCode == 13) {
      if (!event.shiftKey) {
        event.preventDefault();
        sendClick();
      }
      else {
        $("#text_box").html($("#text_box").html() + "<br>");
      }
    }
  });
});
function get_all_chats(chats) {
  $("#chat_box").find(".chatting").empty();

  $.getJSON("/current_user", function (data) {
    var current_user = data;
    chats.forEach(item => {
      var sender = item.sender_id;
      var text = item.content;
      var time = item.sent_at;

      if (sender == current_user) {
        $("#chat_box").find(".chatting").append("<div class='myChat'>" +
          "<div class='me chat'>" + item.content.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div><div class='timeRight'>" + time + "</div></div>");
      }
      else {
        $("#chat_box").find(".chatting").append("<div><div class='receiver'>" + sender + "</div>" + "<div class='opsChat'>" +
          "<div class='op chat'>" + item.content.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div><div class='timeLeft'>" + time + "</div></div></div>");
      }
    });
    $(".chatting").scrollTop($(".chatting")[0].scrollHeight);
  });
}
function get_chats(data) {
  $.getJSON("/chat", data, get_all_chats);
}