<?php

$VOICELINK_VERSION=[0,0,1];

require("_/form.php");
require("_/json.php");
require("_/messages.php");
require("_/auth.php");

function info() {
  global $VOICELINK_VERSION;
  reply("ok",[
	      "version"=>implode(".",$VOICELINK_VERSION),
	      "ip_address"=>$_SERVER["SERVER_ADDR"]
	      ]);
}

if(($a=get("action")) == null)
  reply_error("arg","action");

if($a == "info") {
  info();
} else if($a == "poke") {
  info();
} else if($a == "start_session") {
  auth_start_session();
} else if($a == "verify_session") {
  auth_verify_session();
} else if($a == "end_session") {
  auth_end_session();

} else if($a == "verify_user") {
  auth_verify_user();
} else if($a == "change_name") {
  auth_change_name();
} else if($a == "delete_user") {
  auth_delete_user();

} else if($a == "register") {
  auth_register_user();

} else if($a == "update") {
  messages_update();
} else if($a == "get_messages") {
  messages_get_messages();
} else if($a == "message") {
  message_play();
} else if($a == "delete_message") {
  message_delete();

} else if($a == "upload") {
  messages_upload();

} else {
  reply_error("arg","action");
}

?>