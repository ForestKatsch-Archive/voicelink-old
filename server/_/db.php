<?php

$DB_NAME="link_main";
$DB_NAME_USERS="users";
$DB_NAME_USER_SESSIONS="user_sessions";
$DB_NAME_MESSAGES="messages";
$DB_NAME_MESSAGE_RECIPIENTS="message_recipients";

require("mysql.php");

$db_initialized=false;

function db_init() {
  global $db_initialized;
  if(!$db_initialized)
    mysql_init();
}

db_init();

function db_get_user_id_from_session_id($session_id,$session_hash) {
  auth_needed(true);
  return mysql_get_user_id_from_session_id($session_id,$session_hash);
}

function db_user_exists($handle) {
  return mysql_user_exists($handle);
}

function db_start_session($handle,$password) {
  return mysql_start_session($handle,$password);
}

function db_verify_session($session_id,$session_hash) {
  return mysql_verify_session($session_id,$session_hash);
}

function db_end_session($session_id,$session_hash) {
  return mysql_end_session($session_id,$session_hash);
}

function db_verify_user($handle,$password) {
  return mysql_verify_user($handle,$password);
}

function db_register_user($handle,$password) {
  return mysql_register_user($handle,$password);
}

function db_delete_user($handle,$password) {
  return mysql_delete_user($handle,$password);
}

function db_change_name($user_id,$name) {
  return mysql_change_name($user_id,$name);
}

function db_get_inbox_messages($user_id,$number) {
  return mysql_get_inbox_messages($user_id,$number);
}

function db_add_message($user_id,$filename) {
  return mysql_add_message($user_id,$filename);
}

?>