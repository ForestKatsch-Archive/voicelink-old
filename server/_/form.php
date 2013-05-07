<?php

function get($key) {
  if(isset($_GET[$key]))
    return $_GET[$key];
  return null;
}

?>