// #############################################
// ###### PHASE 2: Refactor file ################
// ### 사용되는 함수를 다른 파일로 분리 ##########
// ### 목적에 맞는 함수 관리를 용이하게 하기 위함##
// #############################################

var current_user;
$(document).ready(function () {
  $.ajax({
    url: "/current_user",
    type: "get",
    success: function (data, txtStatus, xhr) {
      current_user = data;
    }
  });
  console.log(current_user);
  $("#add_friend").click(function () {
    $(".modal").css("display", "block");
  });
  $(".close").click(function () {
    $(".modal").css("display", "none");
  });
  $("#add_friend_btn").click(function () {
    var friend_id = $("#add_friend_id").val();
    if (friend_id == "") {
      alert("친구 ID를 입력해주세요.");
      return;
    }

    if (friend_id == current_user) {
      alert("자기 자신은 친구로 추가할 수 없습니다.");
      return;
    }

    $.ajax({
      url: "/users",
      type: "get",
      success: function (data, txtStatus, xhr) {
        var users = [];
        for (var i = 0; i < data.length; i++) {
          users.push(data[i].name);
        };
        console.log(users);
        if (users.indexOf(friend_id) == -1) {
          alert("존재하지 않는 ID입니다.");
          return;
        }
        $.get("/current_user", function (user, txtStatus, xhr) {
          console.log(user);
          $.ajax({
            url: "/addfriend",
            type: "post",
            data: JSON.stringify({ "user1": user, "user2": friend_id }),
            contentType: "application/json",
            success: function (data, txtStatus, xhr) {
              console.log(data);
              if (data) {
                $("#add_friend_id").val("");
                $(".modal").css("display", "none");
                $("#friends-list").append("<li click='chatStart();'>" + friend_id + "</li>");
                location.reload();
              }
              else if (data == false) {
                alert("이미 친구입니다.");
              }
            }
          })
        });
      }
    });
  });
  $.get("/current_user", function (user, txtStatus, xhr) {
    console.log(user);
    $.ajax({
      url: "/getfriends",
      type: "get",
      data: { "user": user },
      success: function (data, txtStatus, xhr) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          var tmp = "";
          if (data[i].user1_id == user)
            tmp = data[i].user2_id;
          else
            tmp = data[i].user1_id;
          $("#friends-list").append("<li onclick='chatStart();'>" + tmp + "</li>");
        }
      }
    })
  });
});
function chatStart() {
  var friend_id = event.target.innerText;
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