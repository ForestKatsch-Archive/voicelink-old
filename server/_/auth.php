<?php

$AUTH_SESSION_LENGTH=60*60*24*10; // 10 days

require("db.php");

function auth_logged_in() {
  return false;
}

function auth_needed($needed) {
  if(auth_logged_in()) {
    if($needed)
      reply_error("auth","needed");
    else
      reply_error("auth","not_needed");
  }
}

function auth_register_user() {
  auth_needed(false);
  if(!($handle=post("handle")))
    reply_error("arg","handle");
  if(!($password=post("password")))
    reply_error("arg","password");
  if(!($repeat_password=post("repeat_password")))
    reply_error("arg","repeat_password");
  if($password != $repeat_password)
    reply_error("invalid","password");
  if(db_user_exists($handle))
    reply_error("invalid","handle");
  db_register_user($handle,$password);
  reply("ok",[]);
}

function auth_start_session() {
  auth_needed(false);
  if(!($handle=post("handle")))
    reply_error("arg","handle");
  if(!($password=post("password")))
    reply_error("arg","password");
  db_start_session($handle,$password);
}

?>