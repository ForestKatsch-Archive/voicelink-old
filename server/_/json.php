<?php

function reply($status,$reply) {
  $reply["status"]=$status;
  print(json_encode($reply));
  exit();
}

function reply_error($reason,$noun) {
  $reply=[
	  "reason"=>$reason,
	  "noun"=>$noun
	  ];
  reply("error",$reply);
}

?>