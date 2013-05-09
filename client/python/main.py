#!/usr/bin/python3

import voicelink
import readline
import getpass
from textwrap import fill

COMMANDS={
    "help":["Print out information about this client.",
            "<subject> [<subject>[ <subject>]...]",
            "Without an argument, prints out abbreviated help. With a subject argument, prints out detailed help for that subject."],
    "register":["Register for a new VoiceLink account",
                "<handle> [<password> <repeat_password>]",
                "Registers for a new VoiceLink account. Unless you enter the new password and repeat it, you will be prompted for it."],
    "poke":["Checks if the server is alive.",
            "",
            "Checks if the server is alive."],
    "login":["Login to VoiceLink.",
             "<handle>[ <password>]",
             "Login to VoiceLink. Unless you enter your password, you will be prompted for it."],
    "quit":["Quits the VoiceLink client and ends the session.",
            "[fast]",
            "Quits the VoiceLink client and ends the current session. If the 'fast' argument is present, don't log out nicely first."]
}

HELP="""
VoiceLink Python client v{version}.
List of commands:
{commands}

You can run 'help <subject>' to learn more about the command with that name.
""".format(version=".".join([str(x) for x in voicelink.VERSION]),commands="\n".join(["  "+x+(" "*(15-len(x)))+" "+COMMANDS[x][0] for x in COMMANDS.keys()]))

COMMAND_HELP="""
    {command} {args}
{help}
"""

def help(args):
    if type(args) == type(""):
        args=[args]
    if len(args) >= 1:
        for a in args:
            if a not in COMMANDS:
                print("Invalid help subject '"+a+"'.")
            else:
                print(COMMAND_HELP.format(command=a,args=COMMANDS[a][1],help=fill(COMMANDS[a][2])))
    else:
        print(HELP,end="")

def do(c,*args,**kwargs):
    try:
        return c(*args,**kwargs)
    except voicelink.Error as e:
        if e.location == voicelink.SERVER:
            ef="Server error"
        else:
            ef="Error"
        print(ef+": '"+e.noun+"': "+e.strerror)
    except KeyboardInterrupt:
        print("\rCancelled.")

def quit(args):
    if vl.session_verified():
        print("Ending session...")
        vl.session_end()
    exit(0)

def start_session(args):
    if len(args) < 1:
        help("login")
        return
    handle=args[0]
    if len(args) >= 2:
        password=args[1]
    else:
        password=getpass.getpass("Password for "+handle+": ")
        do(vl.start_session,handle,password)

def register(args):
    if len(args) < 1:
        help("register")
        return
    handle=args[0]
    if len(args) == 3:
        password=args[1]
        repeat_password=args[1]
    else:
        password=getpass.getpass("New password: ")
        repeat_password=getpass.getpass("Repeat password: ")
        do(vl.register,handle,password,repeat_password)
        print("Logging in...")
        start_session([handle,password])

def poke(args):
    r=do(vl.poke)
    if r == None:
        pass # cancelled
    elif r == False:
        print("The VoiceLink server '"+vl.host+"' is down.")
    else:
        print("The VoiceLink server '"+vl.host+"' (IP address "+r["ip_address"]+", VoiceLink version "+r["version"]+") is up.")

vl=voicelink.Session()

def go():
    print("VoiceLink v"+".".join([str(x) for x in voicelink.VERSION])+"; type 'help' for a list of commands")
    while True:
        cmd=input("> ").split()
        args=[]
        if len(cmd) < 1:
            continue
        else:
            args=cmd[1:]
        cmd=cmd[0]
        if cmd == "help":
            help(args)
        elif cmd == "quit":
            quit(args)
        elif cmd == "poke":
            poke(args)
        elif cmd == "login":
            start_session(args)
        elif cmd == "register":
            register(args)
        else:
            print("Invalid command.");

if __name__ == "__main__":
    try:
        go()
    except KeyboardInterrupt:
        print("\r")
        exit(0);
