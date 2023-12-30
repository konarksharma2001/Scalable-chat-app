"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";

import {io, Socket} from 'socket.io-client';

interface SocketProviderProps {
    children?: React.ReactNode;
}

interface ISocketContext {
    sendMessage: (msg: string) => any;
    messages: { id: string; message: string }[];
    socket: Socket | undefined; 
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state = useContext(SocketContext);
    if(!state) throw new Error(`State is undefined`);
    return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {

    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<{ id: string; message: string }[]>([]);

    const sendMessage: ISocketContext["sendMessage"] = useCallback((msg)=>{
        console.log("Send Message", msg);
        if(socket){
            socket.emit("event:message",{message:msg});
        }
    },[socket]);

    const onMessageReceived = useCallback((msg: string) => {
        console.log('From Server New Message Received', msg);
    
        // Create an object with id and message properties if msg is a string
        const newMessage = typeof msg === 'string' ? { id: 'defaultId', message: msg } : msg;
    
        // Update the messages state
        setMessages((prev) => [...prev, newMessage]);
    }, []);

    useEffect(()=>{
        const _socket = io("http://localhost:8000");
        setSocket(_socket);
        _socket.on('message',onMessageReceived);

        //clean-up function
        return(()=>{
            _socket.off('message', onMessageReceived);
            _socket.disconnect();
            setSocket(undefined);
        })
    },[]);

    return(
        <SocketContext.Provider value={{sendMessage, messages, socket}}>
            {children}
        </SocketContext.Provider>
    )
}