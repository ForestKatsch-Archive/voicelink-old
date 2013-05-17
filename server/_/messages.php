<?php

function messages_update() {
  auth_needed(true);
  if(!($session_id=post("session_id")))
    reply_error("arg","session_id");
  if(!($session_hash=post("session_hash")))
    reply_error("arg","session_hash");
  $user_id=db_get_user_id_from_session_id($session_id,$session_hash);
  reply("ok",[
	      "folders"=>[
			  "inbox"=>[
				    "number"=>0
				    ],
			  "sent"=>[
				    "number"=>0
				    ],
			  "drafts"=>[
				    "number"=>db_get_draft_message_number($user_id)
				    ],
			  ],
	      "user"=>[

		       ]
	      ]);
}

function messages_get_folder() {
  auth_needed(true);
  if(!($session_id=post("session_id")))
    reply_error("arg","session_id");
  if(!($session_hash=post("session_hash")))
    reply_error("arg","session_hash");
  if(!($folder=post("folder")))
    reply_error("arg","folder");
  if(!($number=post("number")))
    reply_error("arg","number");
  $messages=null;
  $user_id=db_get_user_id_from_session_id($session_id,$session_hash);
  if($folder == "inbox") {
    $messages=db_get_inbox_messages($user_id);
    //  } else if($folder == "sent") {
    //    $messages=db_get_sent_messages($number);
  } else if($folder == "drafts") {
    $messages=db_get_draft_messages($user_id);
  } else {
    reply_error("invalid","folder");
  }
  reply("ok",[
	      "messages"=>$messages
	      ]);
}

function messages_upload() {
  auth_needed(true);
  if(!($session_id=post("session_id")))
    reply_error("arg","session_id");
  if(!($session_hash=post("session_hash")))
    reply_error("arg","session_hash");
  if(!isset($_FILES["data"]["tmp_name"]))
    reply_error("arg","file");
  $file=$_FILES["data"]["tmp_name"];
  $user_id=db_get_user_id_from_session_id($session_id,$session_hash);
  $message_id=db_add_message($user_id,$file);
  rename($file,"/tmp/audio.wav");
  reply("ok",[
	      "message_id"=>$message_id
	      ]);
}

?>