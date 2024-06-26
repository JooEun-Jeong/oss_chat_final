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
    var time = convertToLocalTime(msg.sent_at); // ###### PHASE 2: Feat Reserve Message ########
    console.log("time in ws: " + msg.sent_at);
    var msgSender = msg.sender_name;
    var header_id = msg.header_id;

    $.getJSON("/current_user", function (sender) {
      $.getJSON("/getroom", { user1: sender, user2: friend }, function (data) {
        console.log(header_id + "   " + data.id);
        if (data.id != header_id) {
          return;
        }

        // #############################################
        // ###### PHASE 2: Upload Image ################
        // ### 채팅으로 이미지 업로드 가능 ##########
        // #############################################
        var chatBox = $("#chat_box").find(".chatting");
        if (msgSender != sender) {
          if (text.includes("![image](")) {
            var imageUrl = text.match(/\((.*?)\)/)[1];
            chatBox.append("<div><div class='receiver'>" + msgSender + "</div>" + "<div class='opsChat'>" +
              "<div class='op chat'><img src='" + imageUrl + "' alt='Uploaded Image' style='max-width: 100%; height: auto;'/></div>" +
              "<div class='timeLeft'>" + time + "</div></div></div>");
          } else {
            chatBox.append("<div><div class='receiver'>" + msgSender + "</div>" + "<div class='opsChat'>" +
              "<div class='op chat'>" + text.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div>" +
              "<div class='timeLeft'>" + time + "</div></div></div>");
          }
        } else {
          if (text.includes("![image](")) {
            var imageUrl = text.match(/\((.*?)\)/)[1];
            chatBox.append("<div class='myChat'>" +
              "<div class='me chat'><img src='" + imageUrl + "' alt='Uploaded Image' style='max-width: 100%; height: auto;'/></div>" +
              "<div class='timeRight'>" + time + "</div></div>");
          } else {
            chatBox.append("<div class='myChat'>" +
              "<div class='me chat'>" + text.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div>" +
              "<div class='timeRight'>" + time + "</div></div>");
          }
          ////// END PHASE 2 /////////////
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
      var time = convertToLocalTime(item.sent_at); // ###### PHASE 2: Feat Reserve Message ########
      console.log("time in get_all_chats: " + item.sent_at);

      // #############################################
      // ###### PHASE 2: Upload Image ################
      // ### 채팅으로 이미지 업로드 가능 ##########
      // #############################################
      var chatBox = $("#chat_box").find(".chatting");
      if (text.includes("![image](")) {
        var imageUrl = text.match(/\((.*?)\)/)[1];
        if (sender == current_user) {
          chatBox.append("<div class='myChat'>" +
            "<div class='me chat'><img src='" + imageUrl + "' alt='Uploaded Image' style='max-width: 100%; height: auto;'/></div>" +
            "<div class='timeRight'>" + time + "</div></div>");
        } else {
          chatBox.append("<div><div class='receiver'>" + sender + "</div>" + "<div class='opsChat'>" +
            "<div class='op chat'><img src='" + imageUrl + "' alt='Uploaded Image' style='max-width: 100%; height: auto;'/></div>" +
            "<div class='timeLeft'>" + time + "</div></div></div>");
        }
        // #############################################
        // ###### END PHASE 2: Upload Image ################
        // #############################################
      } else {
        if (sender == current_user) {
          chatBox.append("<div class='myChat'>" +
            "<div class='me chat'>" + text.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div><div class='timeRight'>" + time + "</div></div>");
        } else {
          chatBox.append("<div><div class='receiver'>" + sender + "</div>" + "<div class='opsChat'>" +
            "<div class='op chat'>" + text.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div><div class='timeLeft'>" + time + "</div></div></div>");
        }
      }
    });
    $(".chatting").scrollTop($(".chatting")[0].scrollHeight);
  });
}

function get_chats(data) {
  $.getJSON("/chat", data, get_all_chats);
}

function sendClick(event) {
  var date = new Date();
  var text = $("#text_box").val();
  var fileInput = document.getElementById('image_input');
  var file = fileInput.files[0];

  // #############################################
  // ###### PHASE 2: Upload Image ################
  // ### 채팅으로 이미지 업로드 가능 ##########
  // #############################################
  if (file) {
    uploadImage(file);
    // #############################################
    // ###### END PHASE 2: Upload Image ################
    // #############################################
  } else {
    if (text == "") {
      return;
    }
    sendMessage(text, date);
  }
}

// #############################################
// ###### PHASE 2: Upload Image ################
// ### 채팅으로 이미지 업로드 가능 ##########
// #############################################
function uploadImage(file) {
  $.getJSON("/current_user", function (sender) {
    $.getJSON("/getroom", { user1: sender, user2: friend }, function (data) {
      var formData = new FormData();
      formData.append("current_user_id", sender);
      formData.append("target_user_id", friend);
      formData.append("file", file);

      $.ajax({
        url: "/upload_image",
        type: "post",
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
          alert("Image uploaded successfully");
          fileInput.value = "";
          sendMessage(data.file_url, new Date(), true);
        },
        error: function (request, error) {
          console.log(JSON.stringify(error));
        }
      });
    });
  });
}
// #############################################
// ###### END PHASE 2: Upload Image ################
// #############################################

function sendMessage(text, date, isImage = false) {
  $.getJSON("/current_user", function (sender) {
    $.getJSON("/getroom", { user1: sender, user2: friend }, function (data) {
      var msg = {
        sender_name: sender,
        receiver_name: friend,
        group_id: null,
        header_id: null,
        content: text,
        sent_at: date.toISOString() // new Date -> utc
      };

      console.log("time in sendclick: " + msg.sent_at);


      if (data) {
        msg.header_id = data.id;

        $.ajax({
          url: "/chat",
          type: "post",
          data: JSON.stringify(msg),
          contentType: "application/json",
          success: function (data) {
            updateLastChat(msg.header_id, text);
            ws.send(JSON.stringify(msg));
          },
          error: function (request, error) {
            console.log(JSON.stringify(error));
          },
        });
      } else {
        $.ajax({
          url: "/makeroom",
          data: JSON.stringify({ "from_id": sender, "to_id": friend, "to_group": null, "last_chat": text }),
          contentType: "application/json",
          type: "post",
          success: function (data) {
            console.log(data);
            msg.header_id = data;

            $.ajax({
              url: "/chat",
              type: "post",
              data: JSON.stringify(msg),
              contentType: "application/json",
              success: function (data) {
                updateLastChat(msg.header_id, text);
                ws.send(JSON.stringify(msg));
              },
              error: function (request, error) {
                console.log(JSON.stringify(error));
              },
            });
          }
        });
      }

      // #############################################
      // ###### PHASE 2: Upload Image ################
      // #############################################
      var chatBox = $("#chat_box").find(".chatting");
      if (isImage) {
        chatBox.append("<div class='myChat'>" +
          "<div class='me chat'><img src='" + text + "' alt='Uploaded Image' style='max-width: 100%; height: auto;'/></div>" +
          "<div class='timeRight'>" + convertToLocalTime(date) + "</div></div>");
      } else {
        chatBox.append("<div class='myChat'>" +
          "<div class='me chat'>" + text.replace(/(?:\r\n|\r|\n)/g, '<br/>') + "</div>" +
          "<div class='timeRight'>" + convertToLocalTime(date) + "</div></div>");
      }
      // #############################################
      // ###### END PHASE 2: Upload Image ################
      // #############################################

      $("#text_box").val("");
      $(".chatting").scrollTop($(".chatting")[0].scrollHeight);
      $("#text_box").focus();
    });
  });
}


function updateLastChat(header_id, text) {
  $.ajax({
    url: "/updatelastchat",
    type: "post",
    data: JSON.stringify({ "header_id": header_id, "last_chat": text }),
    contentType: "application/json",
    success: function (data) {
      console.log(data);
    },
    error: function (request, error) {
      console.log(JSON.stringify(error));
    },
  });
}


// #############################################
// ###### PHASE 2: Feat Reserve Message ########
// ### 예약한 시간에 맞게 문자 보내는기능 추가 ####
// #############################################
function convertToUTC(localDateTimeString) {
  // Parse the local date and time string into a Date object
  const localDateTime = new Date(localDateTimeString + ":00");

  // Check if the date is valid
  if (isNaN(localDateTime.getTime())) {
    throw new Error('Invalid date format. Please use "YYYY-MM-DD HH:MM".');
  }

  // Convert to UTC and get the ISO string
  const utcDateTimeString = localDateTime.toISOString();

  return utcDateTimeString;
}

function convertToLocalTime(utcDateStr) {
  let utcDate = new Date(utcDateStr);
  // Convert to local time string
  return utcDate.toLocaleString().slice(12, -3);
}

function sendReserve(event) {
  var text = $("#text_box").val();

  if (text == "") {
    return;
  }

  var send_time = prompt("Enter the send time (YYYY-MM-DD HH:MM):", "2024-06-21 17:50");
  if (!send_time) {
    return;
  }
  send_time = convertToUTC(send_time);
  console.log(send_time);

  $.getJSON("/current_user", function (sender) {
    $.getJSON("/getroom", { user1: sender, user2: friend }, function (data) {
      var msg = {
        current_user_id: sender,
        target_user_id: friend,
        message: text,
        send_time: send_time
      };

      $.ajax({
        url: "/reservemessage",
        type: "post",
        data: JSON.stringify(msg),
        contentType: "application/json",
        success: function (data) {
          alert("Message reserved successfully");
        },
        error: function (request, error) {
          console.log(JSON.stringify(error));
        }
      });

      $("#text_box").val("");
      $("#text_box").focus();
    });
  });
}

// ##################    End   #################
// ###### PHASE 2: Feat Reserve Message ########
// #############################################