<?php

$VOICELINK_VERSION=[0,0,1];

require("_/form.php");
require("_/json.php");
require("_/auth.php");

if(($a=get("action")) == null)
  reply_error("arg","action");

if($a == "info") {
  reply([
	 "version"=>$VOICELINK_VERSION
    ]);
} else if($a == "register") {
  auth_register();
} else {
  reply_error("arg","action");
}

?>