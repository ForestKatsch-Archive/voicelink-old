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

function db_get_user_id_from_session_id($sid,$shash) {
  auth_needed(true);
  return mysql_get_user_id_from_session_id($sid,$shash);
}

function db_user_exists($handle) {
  return mysql_user_exists($handle);
}

function db_start_session($handle,$password) {
  return mysql_start_session($handle,$password);
}

function db_verify_session($sid,$shash) {
  return mysql_verify_session($sid,$shash);
}

function db_end_session($sid,$shash) {
  return mysql_end_session($sid,$shash);
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

function db_get_messages($user_id) {
  return mysql_get_messages($user_id);
}

function db_message_number($user_id) {
  return mysql_message_number($user_id);
}

function db_add_message($user_id,$filename) {
  return mysql_add_message($user_id,$filename);
}

function db_play_message($message_id) {
  return mysql_play_message($message_id);
}

function db_delete_message($message_id) {
  return mysql_delete_message($message_id);
}

function db_send_message($message_id) {
  return mysql_send_message($message_id);
}

function db_clear_recipients($message_id) {
  return mysql_clear_recipients($message_id);
}

function db_add_recipient($message_id,$handle) {
  return mysql_add_recipient($message_id,$handle);
}

?>