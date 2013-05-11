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

function db_register_user($handle,$password) {
  return mysql_register_user($handle,$password);
}

function db_delete_account($handle,$password) {
  return mysql_delete_account($handle,$password);
}

?>