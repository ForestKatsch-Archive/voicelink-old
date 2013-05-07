#!/usr/bin/python3

import http.client
import urllib.parse
import json
import re

VERSION=[0,0,1]
HOST="localhost"
ERROR_REASON_LUT={
    "niy":"Not implemented yet",
    "auth":"Incorrect authorization",
    "arg":"Argument invalid or missing",
}

class Error(Exception):

    def __init__(self,reason,noun):
        self.reason=reason
        self.noun=noun
        self.handle_re=re.compile("^[\w_\-]+$")
        self.strerror=ERROR_REASON_LUT.get(self.reason,"Nonexistent error '"+self.reason+"'")

class Session:
    
    def __init__(self):
        self.log=[]
        self.session={
            "handle":None,
            "session_id":None,
            "session_hash":None,
            "verified":False
            }

    def session_verified(self):
        return self.session.verified
    
    def request(self,action,data):
        params=urllib.parse.urlencode(data)
        conn=http.client.HTTPConnection(HOST)
        conn.connect()
        conn.request("POST","/api.php?action="+urllib.parse.quote_plus(action),params,{
                "User-Agent":"VoiceLink Python client ("+".".join([str(x) for x in VERSION])+")",
                "Content-type":"application/x-www-form-urlencoded",
                "Accept":"text/plain,text/json"})
        response=conn.getresponse()
        try:
            response=json.loads(response.read().decode("utf-8"))
        except ValueError as e:
            raise Error("invalid","response")
        if response["status"] == "error":
            raise Error(response["reason"],response["noun"])

    def register(self,handle,password,repeat_password):
        if self.handle_re.match(handle) == None:
            raise Error("invalid","handle")
        if password != repeat_password:
            raise Error("invalid","password")
        if password != repeat_password:
            raise Error("invalid","password")
        self.request("register",{
                "handle":handle,
                "password":password,
                "repeat_password":repeat_password
                })
