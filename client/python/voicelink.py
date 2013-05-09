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
    "mysql":"MySQL database error",
    "invalid":"Invalid data",
    "server":"Server problem.",
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
    
    def request(self,action,data={},protocol="GET",session=False):
        if session:
            data["session_id"]=self.session["session_id"]
            data["session_hash"]=self.session["session_hash"]
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

    def post_request(self,action,data={},session=False):
        return self.request(action,data,"POST",session)

    # def get_request(self,action,data={}):
    #     return self.request(action,data,"GET")

    def required_fields(self,d,fields):
        for field in fields:
            if field not in d:
                raise Error("invalid",field)
            else:
                if type(d[field]) != type(""):
                    raise TypeError(field+" not of type string")

    def poke(self):
        r=self.get_request("poke")
        self.required_fields(r,["ip_address","version"])
        return r
        
    def start_session(self,handle,password):
        r=self.post_request("start_session",{
                "handle":handle,
                "password":password
                })
        self.required_fields(r,["session_id","session_hash"])
        self.session["handle"]=handle
        self.session["session_id"]=r["session_id"]
        self.session["session_hash"]=r["session_hash"]
        self.session["verified"]=True
        
    def end_session(self):
        if not self.session_verified():
            return;
        r=self.post_request("end_session",{
                },True)
        self.required_fields(r,["session_id","session_hash"])
        self.session["handle"]=handle
        self.session["session_id"]=r["session_id"]
        self.session["session_hash"]=r["session_hash"]
        self.session["verified"]=True
        
    def register(self,handle,password,repeat_password):
        if self.handle_re.match(handle) == None:
            raise Error("invalid","handle",CLIENT)
        if password != repeat_password:
            raise Error("invalid","password",CLIENT)
        if password != repeat_password:
            raise Error("invalid","password",CLIENT)
        r=self.post_request("register",{
                "handle":handle,
                "password":password,
                "repeat_password":repeat_password
                })
        print(handle,password)
        self.start_session(handle,password)
