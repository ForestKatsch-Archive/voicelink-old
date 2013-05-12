<?php

$AUTH_SESSION_LENGTH=60*60*24; // in seconds

require("db.php");

function auth_logged_in() {
  if(!($session_id=post("session_id")))
    return false;
  if(!($session_hash=post("session_hash")))
    return false;
  if(mysql_verify_session($session_id,$session_hash) == false) // it actually returns a dict object
    return false;
  return true;
}

function auth_needed($needed) {
  if(auth_logged_in() == $needed) {
    return;
  } else {
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
  if(!preg_match("/^[\w\-\.]{3,65535}$/",$handle))
    reply_error("invalid","handle");
  if(db_user_exists($handle))
    reply_error("invalid","handle");
  db_register_user($handle,$password);
  reply("ok",[]);
}

function auth_verify_user() {
  auth_needed(true);
  if(!($handle=post("handle")))
    reply_error("arg","handle");
  if(!($password=post("password")))
    reply_error("arg","password");
  db_verify_user($handle,$password);
  reply("ok",[]);
}

function auth_start_session() {
  auth_needed(false);
  if(!($handle=post("handle")))
    reply_error("arg","handle");
  if(!($password=post("password")))
    reply_error("arg","password");
  $session=db_start_session($handle,$password);
  reply("ok",[
	      "session_id"=>$session["session_id"],
	      "session_hash"=>$session["session_hash"],
	      "current_time"=>$session["current_time"],
	      "expires"=>$session["expires"]
	      ]);
}

function auth_verify_session() {
  if(!($session_id=post("session_id")))
    reply_error("arg","session_id");
  if(!($session_hash=post("session_hash")))
    reply_error("arg","session_hash");
  $data=db_verify_session($session_id,$session_hash);
  if($data == false)
    reply("ok",["active"=>"false"]);
  reply("ok",[
	      "active"=>$data["active"],
	      "current_time"=>$data["current_time"],
	      "expires"=>$data["expires"]
	      ]);
}

function auth_end_session() {
  auth_needed(true);
  if(!($session_id=post("session_id")))
    reply_error("arg","session_id");
  if(!($session_hash=post("session_hash")))
    reply_error("arg","session_hash");
  db_end_session($session_id,$session_hash);
  reply("ok",["active"=>"false"]);
}

function auth_delete_user() {
  auth_needed(true);
  if(!($handle=post("handle")))
    reply_error("arg","handle");
  if(!($password=post("password")))
    reply_error("arg","password");
  db_delete_user($handle,$password);
  reply("ok",["active"=>"false"]);
}

?>