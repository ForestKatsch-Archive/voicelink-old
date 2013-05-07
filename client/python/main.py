#!/usr/bin/python3

import voicelink
import readline
import getpass

def go():
    vl=voicelink.Session()
    print("VoiceLink v"+".".join([str(x) for x in voicelink.VERSION])+"; type 'help' for a list of commands")
    while True:
        cmd=input("> ").split()
        args=[]
        if len(cmd) < 1:
            continue
        if cmd == "help":
            print("")
        elif cmd == "register":
            password=getpass.getpass("New password: ")
            repeat_password=getpass.getpass("Repeat password: ")
            try:
                vl.register(handle,password,repeat_password)
            except voicelink.Error as e:
                print("Error: '"+e.noun+"': "+e.strerror)
            except KeyboardInterrupt:
                print("Cancelled.");

if __name__ == "__main__":
    go()
