<?php

function messages_update() {
  auth_needed(true);
  reply("ok",[
	      "folders"=>[
			  "inbox"=>[
				    "unread_messages"=>10,
				    "total_messages"=>10,
				    "archived_messages"=>0
				    ],
			  "sent"=>[
				    "unread_messages"=>0,
				    "total_messages"=>0,
				    "archived_messages"=>0
				    ],
			  "drafts"=>[
				    "unread_messages"=>0,
				    "total_messages"=>0,
				    "archived_messages"=>0
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
    $m=db_get_inbox_messages($user_id,$number);
    //  } else if($folder == "sent") {
    //    $messages=db_get_sent_messages($number);
    //  } else if($folder == "drafts") {
    //    $messages=db_get_draft_messages($number);
  } else {
    reply_error("invalid","folder");
  }
  reply("ok",[
	      "messages"=>$m["messages"],
	      "number"=>$m["number"]
	      ]);
}

?>