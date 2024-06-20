// #############################################
// ###### PHASE 2: Refactor file ################
// ### 사용되는 함수를 다른 파일로 분리 ##########
// ### 목적에 맞는 함수 관리를 용이하게 하기 위함##
// #############################################

$(document).ready(function () {
  $("#btn_login").click(function () {
    login();
  });
  $("#btn_register").click(function () {
    register();
  });
});
function login() {
  var user_name = $("#user_name").val();
  var user_pw = $("#user_pw").val();

  if (user_name == "" || user_pw == "") {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  var data = {
    "username": user_name,
    "password": user_pw
  };
  $.ajax({
    url: "/token",
    type: "post",
    data: data,
    success: function (data, txtStatus, xhr) {
      window.location = "/friends";
    },
    error: function (e) {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
    }
  });
}
function register() {
  var user_name = $("#user_name").val();
  var user_pw = $("#user_pw").val();

  if (user_name == "" || user_pw == "") {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  var data = {
    "username": user_name,
    "password": user_pw
  };

  var users = [];

  $.getJSON("/users", function (user, txtStatus, xhr) {
    for (var i = 0; i < user.length; i++) {
      users.push(user[i].name);
    };
    console.log(users);

    if (users.includes(user_name)) {
      alert("이미 존재하는 아이디입니다.");
    } else {
      $.ajax({
        url: "/register",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, txtStatus, xhr) {
          $("#user_name").val("");
          $("#user_pw").val("");
          alert("회원가입이 완료되었습니다.");
        },
        error: function (e) {
          console.log(e);
        }
      });
    }
  });
}