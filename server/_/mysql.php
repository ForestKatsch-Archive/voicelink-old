<?php

$mysql=null;

$MYSQL_SERVER="link.x10.mx";
$MYSQL_USER="link_user";
$MYSQL_PASSWORD="38h38ifaw4e9oijad";
$MYSQL_DB="link_main";

function mysql_init() {
  global $MYSQL_SERVER,$MYSQL_USER,$MYSQL_PASSWORD,$MYSQL_DB,$mysql;
  $mysql=new mysqli($MYSQL_SERVER,$MYSQL_USER,$MYSQL_PASSWORD,$MYSQL_DB);
  if ($mysqli->connect_errno)
    reply_error("mysql",$mysqli->connect_error);
  mysql_create_tables();
}

function mysql_q() {
  global $mysql;
  if(!($x=$mysql->query(q)))
    reply_error("mysql",$mysql->error);
  return $x;
}

function mysql_create_tables() {
  global $mysql;
  
}

?>