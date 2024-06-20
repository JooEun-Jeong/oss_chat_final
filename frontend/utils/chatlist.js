// #############################################
// ###### PHASE 2: Refactor file ################
// ### 사용되는 함수를 다른 파일로 분리 ##########
// ### 목적에 맞는 함수 관리를 용이하게 하기 위함##
// #############################################

$(document).ready(function () {
  $.get("/current_user", function (user, txtStatus, xhr) {
    console.log(user);
    $.getJSON("/chatlists", { user: user }, function (data, txtStatus, xhr) {
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        if (data[i].to_id == user)
          $("#chat-list").append("<li onclick='chatStart();'><div id='chatentry'><span class='friend'>" + data[i].from_id + "</span><span class='last_chat'>" + data[i].last_chat + "</span></div></li>");
        else if (data[i].from_id == user)
          $("#chat-list").append("<li onclick='chatStart();'><div id='chatentry'><span class='friend'>" + data[i].to_id + "</span><span class='last_chat'>" + data[i].last_chat + "</span></div></li>");
      }
    }
    )
  });
});
function chatStart() {
  var friend_id = $(event.currentTarget).closest("li").find(".friend").text();
  console.log(friend_id);
  $.get("/current_user", function (user, txtStatus, xhr) {
    $.ajax({
      url: "/chatting/" + friend_id,
      type: "get",
      success: function (data, txtStatus, xhr) {
        window.location = "/chatting/" + friend_id;
      }
    })
  });
}