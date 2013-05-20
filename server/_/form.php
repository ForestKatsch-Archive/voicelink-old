<?php

function get($key) {
  if(isset($_GET[$key]))
    return $_GET[$key];
  return null;
}

function gsid() {
  if(!($sid=get("session_id")))
    reply_error("arg","session_id");
  return $sid;
}

function gshash() {
  if(!($shash=get("session_hash")))
    reply_error("arg","session_hash");
  return $shash;
}

function post($key) {
  if(isset($_POST[$key]))
    return $_POST[$key];
  return null;
}

?>