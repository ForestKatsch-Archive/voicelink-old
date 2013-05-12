<?php

function messages_update() {
  auth_needed(true);
  reply("ok",[
	      "folders"=>[
			  "inbox"=>[
				    "unread_messages"=>0,
				    "total_messages"=>0
				    ],
			  "sent"=>[
				    "unread_messages"=>0,
				    "total_messages"=>0
				    ],
			  "drafts"=>[
				    "unread_messages"=>0,
				    "total_messages"=>0
				    ],
			  ],
	      "user"=>[

		       ]
	      ]);
}

?>