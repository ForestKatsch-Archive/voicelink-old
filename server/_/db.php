<?php

require("mysql.php");

$db_initialized=false;

function db_init() {
  global $db_initialized;
  if(!$db_initialized)
    mysql_init();
}

//db_init();

?>