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
  date_default_timezone_set("UTC");
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
  $timestamp=date("Y-m-d H:i:s",time()); 
  mysql_q("insert into $DB_NAME_USERS (handle,password_hash,created_date) VALUES ('$handle','$password_hash','$timestamp')");
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

function mysql_user_id_exists($user_id) {
  global $DB_NAME_USERS;
  $rows=mysql_q("select name from $DB_NAME_USERS WHERE user_id=$user_id");
  if($rows->num_rows != 1)
    return false;
  return true;
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
  $shash=md5($user_id . $expires);
  mysql_q("insert into $DB_NAME_USER_SESSIONS (user_id,session_hash,expires) VALUES ($user_id,'$shash',FROM_UNIXTIME($expires))");
  $rows=mysql_q("select session_id from $DB_NAME_USER_SESSIONS WHERE user_id='$user_id' && session_hash='$shash'");
  if($rows->num_rows != 1)
    reply_error("mysql","Expected one unique session hash/user combination");
  $row=$rows->fetch_assoc();
  $sid=$row["session_id"];
  return [
	  "name"=>$name,
	  "session_id"=>$sid,
	  "session_hash"=>$shash,
	  "current_time"=>$timestamp,
	  "expires"=>$expires];
}

function mysql_end_expired_sessions($user_id) {
  global $DB_NAME_USER_SESSIONS;
  mysql_q("delete from $DB_NAME_USER_SESSIONS WHERE user_id=$user_id AND expires<=NOW()");
}

function mysql_get_user_id_from_session_id($sid,$shash) {
  global $DB_NAME_USER_SESSIONS;
  $rows=mysql_q("select user_id from $DB_NAME_USER_SESSIONS WHERE session_id=$sid and session_hash='$shash'");
  if($rows->num_rows < 1)
    return false;
  return $rows->fetch_assoc()["user_id"];
}

function mysql_end_expired_sessions_from_id($sid,$shash) {
  global $DB_NAME_USER_SESSIONS;
  $user_id=mysql_get_user_id_from_session_id($sid,$shash);
  if(!$user_id)
    return;
  mysql_end_expired_sessions($user_id);
}

function mysql_end_all_sessions($user_id) {
  global $DB_NAME_USER_SESSIONS;
  mysql_q("delete from $DB_NAME_USER_SESSIONS WHERE user_id=$user_id");
}

function mysql_end_session($sid,$shash) {
  global $DB_NAME_USER_SESSIONS;
  if(mysql_verify_session($sid,$shash) != false)
    mysql_q("delete from $DB_NAME_USER_SESSIONS WHERE session_id=$sid AND session_hash='$shash'");
  else
    reply_error("auth","needed");
  mysql_end_expired_sessions_from_id($sid,$shash);
}

function mysql_verify_session($sid,$shash) {
  global $DB_NAME_USER_SESSIONS;
  $rows=mysql_q("select session_hash,user_id,expires from $DB_NAME_USER_SESSIONS WHERE session_id=$sid");
  if($rows->num_rows != 1)
    reply_error("invalid","session");
  $row=$rows->fetch_assoc();
  $date=new DateTime();
  $timestamp=$date->getTimestamp();
  $expires=$row["expires"];
  $expires=strtotime($row["expires"]);
  if($shash != $row["session_hash"])
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

function mysql_get_recipients($message_id) {
  global $DB_NAME_MESSAGES,$DB_NAME_MESSAGE_RECIPIENTS;
  $q="select to_user_id from $DB_NAME_MESSAGE_RECIPIENTS where message_id=$message_id";
  $result=mysql_q($q);
  $recipients=[];
  while($row=$result->fetch_assoc()) {
    $recipients[]=mysql_get_handle_from_user_id($row["to_user_id"]);
  }
  return $recipients;
}

function mysql_get_inbox_messages($user_id) {
  global $DB_NAME_MESSAGES,$DB_NAME_MESSAGE_RECIPIENTS;
  $messages=[];
  $req="select message_id,to_user_id from $DB_NAME_MESSAGE_RECIPIENTS where to_user_id=$user_id";
  $rresult=mysql_q($req);
  while($row=$rresult->fetch_assoc()) {
    $mid=$row["message_id"];
    if(!isset($messages[$mid])) {
      $mq="select from_user_id,duration,composed,sent from $DB_NAME_MESSAGES where message_id=$mid";
      $mresult=mysql_q($mq);
      if($mresult->num_rows != 1)
	continue; // message no longer exists
      $message=$mresult->fetch_assoc();
      $from=mysql_get_handle_from_user_id($message["from_user_id"]);
      $messages[$mid]=[
		       "message_id"=>$mid,
		       "duration"=>$message["duration"],
		       "folders"=>["inbox"],
		       "from"=>mysql_get_handle_from_user_id($message["from_user_id"]),
		       "reply_to"=>-1,
		       "to"=>mysql_get_recipients($mid),
		       "composed"=>strtotime($message["composed"]),
		       "sent"=>strtotime($message["sent"]),
		       ];
    } else {
      $messages[$mid]["to"][]=$row["to_user_id"];
    }
  }
  return $messages;
}

function mysql_get_draft_messages($user_id) {
  global $DB_NAME_MESSAGES;
  $messages=[];
  $q="select message_id,duration,composed from $DB_NAME_MESSAGES WHERE from_user_id=$user_id AND draft=1 ORDER BY composed DESC";
  $result=mysql_q($q);
  $handle=mysql_get_handle_from_user_id($user_id);
  while($row=$result->fetch_assoc()) {
    $messages[$row["message_id"]]=[
		 "message_id"=>$row["message_id"],
		 "duration"=>$row["duration"],
		 "folders"=>["drafts"],
		 "from"=>$handle,
		 "reply_to"=>-1,
		 "to"=>mysql_get_recipients($row["message_id"]),
		 "composed"=>strtotime($row["composed"]),
		 "sent"=>-1
		 ];
  }
  return $messages;
}

function mysql_get_sent_messages($user_id) {
  global $DB_NAME_MESSAGES;
  $messages=[];
  $q="select message_id,duration,composed from $DB_NAME_MESSAGES WHERE from_user_id=$user_id AND draft=0 ORDER BY composed DESC";
  $result=mysql_q($q);
  $handle=mysql_get_handle_from_user_id($user_id);
  while($row=$result->fetch_assoc()) {
    $messages[$row["message_id"]]=[
		 "message_id"=>$row["message_id"],
		 "duration"=>$row["duration"],
		 "folders"=>["sent"],
		 "from"=>$handle,
		 "reply_to"=>-1,
		 "to"=>mysql_get_recipients($row["message_id"]),
		 "composed"=>strtotime($row["composed"]),
		 "sent"=>-1
		 ];
  }
  return $messages;
}

function mysql_get_messages($user_id) {
  if(!mysql_user_id_exists($user_id))
    reply_error("invalid","user");
  $messages=mysql_get_inbox_messages($user_id);
  foreach(mysql_get_draft_messages($user_id) as $m) {
    $existing=false;
    foreach($messages as $om) {
      if($m["message_id"] == $om["message_id"]) {
	$messages[$m["message_id"]]->folder[]="draft";
	$existing=true;
      }
    }
    if($existing == false)
      $messages[$m["message_id"]]=$m;
  }
  foreach(mysql_get_sent_messages($user_id) as $m) {
    $existing=false;
    foreach($messages as $om) {
      if($m["message_id"] == $om["message_id"]) {
	$messages[$m["message_id"]]->folder[]="sent";
	$existing=true;
      }
    }
    if($existing == false)
      $messages[$m["message_id"]]=$m;
  }
  return $messages;
}

function mysql_inbox_message_number($user_id) {
  global $DB_NAME_MESSAGES,$DB_NAME_MESSAGE_RECIPIENTS;
  $messages=[];
  $q="select message_id from $DB_NAME_MESSAGE_RECIPIENTS where to_user_id=$user_id";
  $result=mysql_q($q);
  return $result->num_rows;
}

function mysql_sent_message_number($user_id) {
  global $DB_NAME_MESSAGES;
  $messages=[];
  $q="select message_id,duration,composed from $DB_NAME_MESSAGES WHERE from_user_id=$user_id AND draft=0";
  $result=mysql_q($q);
  return $result->num_rows;
}

function mysql_draft_message_number($user_id) {
  global $DB_NAME_MESSAGES;
  $messages=[];
  $q="select message_id,duration,composed from $DB_NAME_MESSAGES WHERE from_user_id=$user_id AND draft=1";
  $result=mysql_q($q);
  return $result->num_rows;
}

function mysql_message_number($user_id) {
  if(!mysql_user_id_exists($user_id))
    reply_error("invalid","user");
  return mysql_inbox_message_number($user_id)+
    mysql_sent_message_number($user_id)+
    mysql_draft_message_number($user_id);
}

function mysql_add_message($user_id,$file) {
  global $DB_NAME_MESSAGES;
  $data=file_get_contents($file);
  $data=mysql_escape($data);
  $fp=fopen($file,"r");
  $size=filesize($file)*1000;
  fseek($fp,20);
  $rawheader=fread($fp, 16);
  $header=unpack("vtype/vchannels/Vsamplerate/Vbytespersec/valignment/vbits",$rawheader);
  $duration=ceil($size/$header['bytespersec']);
  $timestamp=date("Y-m-d H:i:s",time()); 
  mysql_q("insert into $DB_NAME_MESSAGES (from_user_id,wav_data,duration,composed) VALUES ($user_id,'$data',$duration,'$timestamp')");
  $rows=mysql_q("select message_id from $DB_NAME_MESSAGES where from_user_id=$user_id and wav_data='$data'");
  if($rows->num_rows != 1)
    reply_error("invalid","rows");
  $row=$rows->fetch_assoc();
  $message_id=$row["message_id"];
  return $message_id;
}

function mysql_verify_message($message_id) {
  global $DB_NAME_MESSAGES,$DB_NAME_MESSAGE_RECIPIENTS;
  if(!($sid=get("session_id")))
    reply_error("auth","needed");
  if(!($shash=get("session_hash")))
    reply_error("auth","needed");
  $user_id=mysql_get_user_id_from_session_id($sid,$shash);
  $mrows=mysql_q("select from_user_id,sent,draft from $DB_NAME_MESSAGES WHERE message_id=$message_id");
  if($mrows->num_rows != 1)
    reply_error("invalid","rows");
  $mrow=$mrows->fetch_assoc();
  if($mrow["draft"] == 0) {
    $rrows=mysql_q("select to_user_id from $DB_NAME_MESSAGE_RECIPIENTS WHERE message_id=$message_id");
    if($mrows->num_rows >= 1) {
      while($rrow=$rrows->fetch_assoc()) {
	$to=$rrow["to_user_id"];
	if($to == $user_id)
	  return true;
      }
    }
  }
  if($mrow["from_user_id"] == $user_id)
    return true;
  error_log("NOT ALLOWED TO PLAY MESSAGE");
  print("");
}

function mysql_play_message($message_id) {
  global $DB_NAME_MESSAGES;
  mysql_verify_message($message_id);
  $rows=mysql_q("select wav_data from $DB_NAME_MESSAGES WHERE message_id=$message_id");
  if($rows->num_rows != 1)
    reply_error("invalid","rows");
  $row=$rows->fetch_assoc();
  print($row["wav_data"]);
  exit(0);
}

function mysql_recipient_number($message_id) {
  global $DB_NAME_MESSAGE_RECIPIENTS;
  mysql_verify_message($message_id);
  $result=mysql_q("select message_id from $DB_NAME_MESSAGE_RECIPIENTS WHERE message_id=$message_id");
  return $result->num_rows;
}

function mysql_delete_message($message_id) {
  global $DB_NAME_MESSAGES;
  mysql_verify_message($message_id);
  mysql_q("delete from $DB_NAME_MESSAGES WHERE message_id=$message_id");
  return;
}

function mysql_send_message($message_id) {
  global $DB_NAME_MESSAGES;
  mysql_verify_message($message_id);
  if(mysql_recipient_number($message_id) == 0)
    reply_error("invalid","handle");
  $timestamp=date("Y-m-d H:i:s",time()); 
  mysql_q("update $DB_NAME_MESSAGES set sent='$timestamp',draft=0 where message_id=$message_id");
  return;
}

function mysql_clear_recipients($message_id) {
  global $DB_NAME_MESSAGE_RECIPIENTS;
  mysql_verify_message($message_id);
  mysql_q("delete from $DB_NAME_MESSAGE_RECIPIENTS WHERE message_id=$message_id");
  return;
}

function mysql_add_recipient($message_id,$handle) {
  global $DB_NAME_MESSAGE_RECIPIENTS;
  mysql_verify_message($message_id);
  $user_id=mysql_get_user_id_from_handle($handle);
  mysql_q("insert into $DB_NAME_MESSAGE_RECIPIENTS (message_id,to_user_id) values ($message_id,$user_id)");
  return;
}

?>