#!/usr/bin/python3

import http.client
import urllib.parse
import json
import re

VERSION=[0,0,1]
ERROR_REASON_LUT={
    "niy":"Not implemented yet",
    "auth":"Incorrect authorization",
    "arg":"Argument invalid or missing",
    "invalid":"Invalid data",
    "http":"HTTP response",
}

SERVER=0
CLIENT=1

class Error(Exception):

    def __init__(self,reason,noun,location=SERVER):
        self.reason=reason
        self.noun=noun
        self.location=location
        self.strerror=ERROR_REASON_LUT.get(self.reason,"Nonexistent error '"+self.reason+"'")

class Session:
    
    def __init__(self,host="localhost"):
        self.log=[]
        self.host=host
        self.handle_re=re.compile("^[\w_\-]+$")
        self.session={
            "handle":None,
            "session_id":None,
            "session_hash":None,
            "verified":False
            }

    def session_verified(self):
        return self.session["verified"]
    
    def request(self,action,data={},protocol="GET"):
        params=urllib.parse.urlencode(data)
        get_params=""
        post_params=""
        if protocol == "GET":
            get_params="&"+params
        elif protocol == "POST":
            post_params=params
        conn=http.client.HTTPConnection(self.host)
        conn.connect()
        conn.request(protocol,"/api.php?action="+urllib.parse.quote_plus(action)+get_params,post_params,{
                "User-Agent":"VoiceLink Python client ("+".".join([str(x) for x in VERSION])+")",
                "Content-type":"application/x-www-form-urlencoded",
                "Accept":"text/plain,text/json"})
        response=conn.getresponse()
        if(response.status != 200):
            raise Error("http",str(response.status))
        try:
            response=json.loads(response.read().decode("utf-8"))
        except ValueError as e:
            raise Error("invalid","response")
        if response["status"] == "error":
            raise Error(response["reason"],response["noun"])
        self.log.append([protocol,action,data,response])
        return response

    def post_request(self,action,data={}):
        return self.request(action,data,"POST")

    def get_request(self,action,data={}):
        return self.request(action,data,"GET")

    def required_fields(self,d,fields):
        for field in fields:
            if field not in d:
                raise ValueError(field+" not in dictionary")
            else:
                if type(d[field]) != type(""):
                    raise TypeError(field+" not of type string")

    def poke(self):
        try:
            r=self.get_request("poke")
            try:
                self.required_fields(r,["ip_address","version"])
            except ValueError:
                raise Error("invalid","response")
            except TypeError:
                raise Error("invalid","response")
            return r
        except Error as e:
            if e.location == SERVER:
                return False
            else:
                raise e
        
    def register(self,handle,password,repeat_password):
        if self.handle_re.match(handle) == None:
            raise Error("invalid","handle",CLIENT)
        if password != repeat_password:
            raise Error("invalid","password",CLIENT)
        if password != repeat_password:
            raise Error("invalid","password",CLIENT)
        self.post_request("register",{
                "handle":handle,
                "password":password,
                "repeat_password":repeat_password
                })
