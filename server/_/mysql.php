<?php

$mysql=null;

$MYSQL_SERVER="";
$MYSQL_USER="link_user";
$MYSQL_PASSWORD="38h38ifaw4e9oijad";
$MYSQL_DB="link_main";

function mysql_connect() {
  global $MYSQL_SERVER,$MYSQL_USER,$MYSQL_PASSWORD,$MYSQL_DB;
  $mysql=new mysqli($MYSQL_SERVER,$MYSQL_USER,$MYSQL_PASSWORD,$MYSQL_DB);
}

?>