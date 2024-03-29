<?php

function messages_update() {
  auth_needed(true);
  $sid=gsid();
  $shash=gshash();
  $user_id=db_get_user_id_from_session_id($sid,$shash);
  reply("ok",[
	      "message_number"=>db_message_number($user_id),
	      "user"=>[

		       ]
	      ]);
}

function messages_get_messages() {
  auth_needed(true);
  $sid=gsid();
  $shash=gshash();
  $messages=null;
  $user_id=db_get_user_id_from_session_id($sid,$shash);
  reply("ok",[
	      "messages"=>db_get_messages($user_id)
	      ]);
}

function messages_upload() {
  auth_needed(true);
  $sid=gsid();
  $shash=gshash();
  if(!isset($_FILES["data"]["tmp_name"]))
    reply_error("arg","file");
  $file=$_FILES["data"]["tmp_name"];
  $user_id=db_get_user_id_from_session_id($sid,$shash);
  $message_id=db_add_message($user_id,$file);
  rename($file,"/tmp/audio.wav");
  reply("ok",[
	      "message_id"=>$message_id
	      ]);
}

function message_play() {
  auth_needed(true);
  if(!($message_id=get("message_id")))
    reply_error("arg","message_id");
  header("Content-type: audio/wav");
  db_play_message($message_id);
}

function message_delete() {
  auth_needed(true);
  if(!($message_id=post("message_id")))
    reply_error("arg","message_id");
  db_delete_message($message_id);
  reply("ok",[]);
}

function message_set_recipients() {
  auth_needed(true);
  if(!($message_id=post("message_id")))
    reply_error("arg","message_id");
  if(!($recipients=post("recipients")))
    reply_error("arg","recipients");
  $recipients=explode(",",$recipients);
  if(count($recipients) == 0) {
    reply_error("arg","recipients");
  }
  foreach($recipients as $handle) {
    if(!preg_match("/^[\w\-\.]{3,65535}$/",$handle))
      reply_error("invalid","handle");
    if(!db_user_exists($handle))
      reply_error("invalid","handle");
  }
  db_clear_recipients($message_id);
  foreach($recipients as $handle) {
    db_add_recipient($message_id,$handle);
  }
  reply("ok",[]);
}

function message_send_message() {
  auth_needed(true);
  if(!($message_id=post("message_id")))
    reply_error("arg","message_id");
  db_send_message($message_id);
  reply("ok",[]);
}

?>