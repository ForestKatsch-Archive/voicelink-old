<?php

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

function auth_register() {
  auth_needed(false);
  if(!post("handle"))
    reply_error("arg","handle");
  if(!post("password"))
    reply_error("arg","password");
  if(!post("repeat_password"))
    reply_error("arg","repeat_password");
  reply_error("niy","register");
}

?>