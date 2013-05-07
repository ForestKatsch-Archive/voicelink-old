<?php

$VOICELINK_VERSION=[0,0,1];

require("_/form.php");
require("_/json.php");

if(($a=get("action")) == null)
  reply_error("action","undefined");

if($a == "info") {
  reply([
	 "version"=>$VOICELINK_VERSION
    ]);
} else {
  reply_error("action","invalid");
}

?>