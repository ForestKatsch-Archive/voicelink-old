<?php

function reply($status,$reply) {
  $reply["status"]=$status;
  print(json_encode($reply));
}

function reply_error($reason,$noun) {
  $reply=[
	  "status"=>"error",
	  "reason"=>$reason,
	  "noun"=>$noun
	  ];
  print(json_encode($reply));
}

?>