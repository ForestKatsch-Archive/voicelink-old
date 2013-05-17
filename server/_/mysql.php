<?php

$mysql=null;

//$MYSQL_SERVER="link.x10.mx";
//$MYSQL_USER="link_user";
//$MYSQL_PASSWORD="38h38ifaw4e9oijad";
//$MYSQL_DB="link_main";
$MYSQL_SERVER="localhost";
$MYSQL_USER="root";
$MYSQL_PASSWORD="mysql";

function mysql_init() {
  global $MYSQL_SERVER,$MYSQL_USER,$MYSQL_PASSWORD,$mysql,$DB_NAME;
  $mysql=new mysqli($MYSQL_SERVER,$MYSQL_USER,$MYSQL_PASSWORD);
  if ($mysql->connect_errno)
    reply_error("mysql",$mysqli->connect_error);
  $mysql->select_db($DB_NAME);
  //  mysql_setup_database();
  //  mysql_setup_tables();
}

function mysql_q($q) {
  global $mysql;
  if(!($x=$mysql->query($q)))
    reply_error("mysql",$mysql->error);
  return $x;
}

function mysql_setup_database() {
  global $DB_NAME,$mysql;
  mysql_q("create database if not exists $DB_NAME");
  $mysql->select_db($DB_NAME);
  $mysql->commit();
}

function mysql_setup_tables() {
  global $DB_NAME_USERS,$DB_NAME_USER_SESSIONS,$DB_NAME_MESSAGES,$DB_NAME_MESSAGE_RECIPIENTS;
  if(true) {
    mysql_q("drop table if exists $DB_NAME_USERS");
    mysql_q("drop table if exists $DB_NAME_USER_SESSIONS");
    mysql_q("drop table if exists $DB_NAME_MESSAGES");
    mysql_q("drop table if exists $DB_NAME_MESSAGE_RECIPIENTS");
  }
  mysql_q("create table if not exists $DB_NAME_USERS (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  handle TEXT,
  password_hash TEXT,
  name TEXT,
  email TEXT,
  about TEXT,
  email_verified TINYINT(1) DEFAULT 0,
  created_date TIMESTAMP)");
  mysql_q("create table if not exists $DB_NAME_USER_SESSIONS (
  session_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  session_hash TEXT,
  expires TIMESTAMP)");
  mysql_q("create table if not exists $DB_NAME_MESSAGES (
  message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  from_user_id BIGINT,
  duration INT,
  wav_data LONGBLOB,
  reply_to BIGINT DEFAULT 0,
  draft TINYINT(1) DEFAULT 1,
  composed TIMESTAMP,
  sent TIMESTAMP DEFAULT 0)");
  mysql_q("create table if not exists $DB_NAME_MESSAGE_RECIPIENTS (
  message_recipient_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  message_id BIGINT,
  to_user_id BIGINT,
  opened TINYINT(1) DEFAULT 0,
  archived TINYINT(1) DEFAULT 0)");
}

function mysql_escape($t) {
  global $mysql;
  return $mysql->real_escape_string($t);
}

function mysql_user_exists($handle) {
  global $DB_NAME_USERS;
  $handle=mysql_escape($handle);
  $rows=mysql_q("select user_id from $DB_NAME_USERS where handle='$handle'");
  if($rows->num_rows == 1)
    return true;
  else
    return false;
}

function mysql_get_user_id_from_handle($handle) {
  global $DB_NAME_USERS;
  $handle=mysql_escape($handle);
  $rows=mysql_q("select user_id from $DB_NAME_USERS where handle='$handle'");
  if($rows->num_rows != 1)
    reply_error("mysql","Expected one user");
  $row=$rows->fetch_assoc();
  return $row["user_id"];
}

function mysql_get_handle_from_user_id($user_id) {
  global $DB_NAME_USERS;
  $rows=mysql_q("select handle from $DB_NAME_USERS where user_id=$user_id");
  if($rows->num_rows != 1)
    return false;
  $row=$rows->fetch_assoc();
  return $row["handle"];
}

function mysql_register_user($handle,$password) {
  global $DB_NAME_USERS;
  $handle=mysql_escape($handle);
  if(mysql_user_exists($handle))
    reply_error("invalid","handle");
  $password_hash=md5($password);
  mysql_q("insert into $DB_NAME_USERS (handle,password_hash) VALUES ('$handle','$password_hash')");
}

function mysql_verify_user($handle,$password) {
  global $DB_NAME_USERS;
  $handle=mysql_escape($handle);
  if(!mysql_user_exists($handle))
    reply_error("invalid","handle");
  $rows=mysql_q("select password_hash from $DB_NAME_USERS WHERE handle='$handle'");
  if($rows->num_rows != 1)
    reply_error("mysql","Expected one user");
  $row=$rows->fetch_assoc();
  $password_hash=$row["password_hash"];
  $hash=md5($password);
  if($password_hash != $hash)
    reply_error("auth","password");
}

function mysql_get_name($user_id) {
  global $DB_NAME_USERS;
  $rows=mysql_q("select name from $DB_NAME_USERS WHERE user_id=$user_id");
  if($rows->num_rows != 1)
    return "";
  return $rows->fetch_assoc()["name"];
}

function mysql_delete_user($handle,$password) {
  global $DB_NAME_USERS;
  $handle=mysql_escape($handle);
  if(!mysql_user_exists($handle))
    reply_error("invalid","handle");
  mysql_verify_user($handle,$password);
  $user_id=mysql_get_user_id_from_handle($handle);
  mysql_end_all_sessions($user_id);
  mysql_q("delete from $DB_NAME_USERS WHERE user_id=$user_id");
  return;
}

function mysql_start_session($handle,$password,$expires=null) {
  global $DB_NAME_USERS,$DB_NAME_USER_SESSIONS,$AUTH_SESSION_LENGTH;
  $handle=mysql_escape($handle);
  if(!mysql_user_exists($handle))
    reply_error("invalid","handle");
  mysql_verify_user($handle,$password);
  $user_id=mysql_get_user_id_from_handle($handle);
  $name=mysql_get_name($user_id);
  mysql_end_expired_sessions($user_id);
  $date=new DateTime();
  $timestamp=$date->getTimestamp();
  if($expires == null)
    $expires=$AUTH_SESSION_LENGTH;
  $expires=$expires+$timestamp;
  $session_hash=md5($user_id . $expires);
  mysql_q("insert into $DB_NAME_USER_SESSIONS (user_id,session_hash,expires) VALUES ($user_id,'$session_hash',FROM_UNIXTIME($expires))");
  $rows=mysql_q("select session_id from $DB_NAME_USER_SESSIONS WHERE user_id='$user_id' && session_hash='$session_hash'");
  if($rows->num_rows != 1)
    reply_error("mysql","Expected one unique session hash/user combination");
  $row=$rows->fetch_assoc();
  $session_id=$row["session_id"];
  return [
	  "name"=>$name,
	  "session_id"=>$session_id,
	  "session_hash"=>$session_hash,
	  "current_time"=>$timestamp,
	  "expires"=>$expires];
}

function mysql_end_expired_sessions($user_id) {
  global $DB_NAME_USER_SESSIONS;
  mysql_q("delete from $DB_NAME_USER_SESSIONS WHERE user_id=$user_id AND expires<=NOW()");
}

function mysql_get_user_id_from_session_id($session_id,$session_hash) {
  global $DB_NAME_USER_SESSIONS;
  $rows=mysql_q("select user_id from $DB_NAME_USER_SESSIONS WHERE session_id=$session_id and session_hash='$session_hash'");
  if($rows->num_rows < 1)
    return false;
  return $rows->fetch_assoc()["user_id"];
}

function mysql_end_expired_sessions_from_id($session_id,$session_hash) {
  global $DB_NAME_USER_SESSIONS;
  $user_id=mysql_get_user_id_from_session_id($session_id,$session_hash);
  if(!$user_id)
    return;
  mysql_end_expired_sessions($user_id);
}

function mysql_end_all_sessions($user_id) {
  global $DB_NAME_USER_SESSIONS;
  mysql_q("delete from $DB_NAME_USER_SESSIONS WHERE user_id=$user_id");
}

function mysql_end_session($session_id,$session_hash) {
  global $DB_NAME_USER_SESSIONS;
  if(mysql_verify_session($session_id,$session_hash) != false)
    mysql_q("delete from $DB_NAME_USER_SESSIONS WHERE session_id=$session_id AND session_hash='$session_hash'");
  else
    reply_error("auth","needed");
  mysql_end_expired_sessions_from_id($session_id,$session_hash);
}

function mysql_verify_session($session_id,$session_hash) {
  global $DB_NAME_USER_SESSIONS;
  $rows=mysql_q("select session_hash,user_id,expires from $DB_NAME_USER_SESSIONS WHERE session_id=$session_id");
  if($rows->num_rows != 1)
    reply_error("invalid","session");
  $row=$rows->fetch_assoc();
  $date=new DateTime();
  $timestamp=$date->getTimestamp();
  $expires=$row["expires"];
  $expires=strtotime($row["expires"]);
  //  error_log($expires . "  " . $timestamp);
  if($session_hash != $row["session_hash"])
    return false;
  if($expires < $timestamp)
    return false;
  return [
	  "active"=>"true",
	  "current_time"=>$timestamp,
	  "expires"=>$expires
	  ];
}

function mysql_change_name($user_id,$name) {
  $name=mysql_escape($name);
  global $DB_NAME_USERS;
  mysql_q("update $DB_NAME_USERS set name='$name' where user_id=$user_id");
}

function mysql_get_inbox_messages($user_id) {
  global $DB_NAME_MESSAGES,$DB_NAME_MESSAGE_RECIPIENTS;
  $messages=[];
  $q="select messages.message_id,messages.from_user_id,messages.sent 
from $DB_NAME_MESSAGES, $DB_NAME_MESSAGE_RECIPIENTS 
where ($DB_NAME_MESSAGE_RECIPIENTS.to_user_id=$user_id 
&& $DB_NAME_MESSAGES.message_id=$DB_NAME_MESSAGE_RECIPIENTS.message_id) 
ORDER BY messages.sent DESC";
  $result=mysql_q($q);
  while($row=$result->fetch_assoc()) {
    $from=mysql_get_handle_from_user_id($row["from_user_id"]);
    $messages[]=[
		 "message_id"=>$row["message_id"],
		 "duration"=>$row["duration"],
		 "sent"=>strtotime($row["sent"]),
		 "from"=>$from
		 ];
  }
  return $messages;
}

function mysql_get_draft_messages($user_id) {
  global $DB_NAME_MESSAGES;
  $messages=[];
  $q="select message_id,duration,composed from $DB_NAME_MESSAGES WHERE from_user_id=$user_id ORDER BY composed DESC";
  $result=mysql_q($q);
  while($row=$result->fetch_assoc()) {
    $messages[]=[
		 "message_id"=>$row["message_id"],
		 "duration"=>$row["duration"],
		 "composed"=>strtotime($row["composed"]),
		 ];
  }
  return $messages;
}

function mysql_get_draft_message_number($user_id) {
  global $DB_NAME_MESSAGES;
  $messages=[];
  $q="select message_id,duration,composed from $DB_NAME_MESSAGES WHERE from_user_id=$user_id";
  $result=mysql_q($q);
  error_log($result->num_rows);
  return $result->num_rows;
}

function mysql_add_message($user_id,$file) {
  global $DB_NAME_MESSAGES;
  $data=file_get_contents($file);
  $data=mysql_escape($data);
  $fp=fopen($file,"r");
  $size_in_bytes=filesize($file);
  fseek($fp,20);
  $rawheader=fread($fp, 16);
  $header=unpack("vtype/vchannels/Vsamplerate/Vbytespersec/valignment/vbits",$rawheader);
  $duration=ceil($size_in_bytes/$header['bytespersec']);
  mysql_q("insert into $DB_NAME_MESSAGES (from_user_id,wav_data,duration) VALUES ($user_id,'$data',$duration)");
  $rows=mysql_q("select message_id from $DB_NAME_MESSAGES where from_user_id=$user_id and wav_data='$data'");
  if($rows->num_rows != 1)
    reply_error("invalid","rows");
  $row=$rows->fetch_assoc();
  $message_id=$row["message_id"];
  return $message_id;
}


?>