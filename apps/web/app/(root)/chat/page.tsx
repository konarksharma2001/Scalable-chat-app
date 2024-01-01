"use client";
import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../../context/SocketProvider";
import "../../styles.css";
import "react-chat-elements/dist/main.css";
import React from "react";
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { IoCopyOutline } from "react-icons/io5";

const page = () => {
  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");
  const { socket } = useSocket();
  const displayScreenRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  let roomCode = searchParams.get('roomCode');
  
  const formatAMPM = (date: Date) => {
    let hours = date.getHours();
    let minutes: any = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {

      // Get the current time in "hh:mm AM/PM" format
      const currentTime = formatAMPM(new Date());
      // Combine the message and timestamp
      const fullMessage = `${message} -${currentTime}`;
      // Send the combined message
      sendMessage(fullMessage);
      setMessage("");
    } 
    else {
      toast.error("Enter a message to be sent...");
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default behavior of the Enter key
      handleSendMessage();
    }
  };

  const copyHandler = async () => {
    try {
      if (roomCode) {
        await navigator.clipboard.writeText(roomCode);
        toast.success(`Room Code copied to clipboard`);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy Room Code to clipboard');
    }
  };

   // Scroll to the bottom whenever messages change
   useEffect(() => {
    if (displayScreenRef.current) {
      // Set the scroll position to the bottom
      displayScreenRef.current.scrollTop = displayScreenRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div className="app">
      <h1 className="heading">Real Time Scalable Chat App</h1>
      <p className="chatroom">Chat Room Code: {roomCode} <span><button onClick={copyHandler} className="copybtn"><IoCopyOutline className="cpy"/></button></span></p>
      <div ref={displayScreenRef} className="display-screen">
        <div className="background-container">
          {messages.map((e, index) => {
            // Split the message and time
            const [message, time] = e.message.split('-');
            return (
              <p
                key={index}
                className={`messages ${e.id === socket?.id ? "user1" : "user2"}`}
              >
                {message} <span className="subscript-time">{e.name} : {time}</span>
              </p>
            );
          })}
        </div>
      </div>
      <div className="flex">
        <input
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          value={message}
          className="chat-input"
          type="text"
          placeholder="Type a message ..."
        />
        <button onClick={handleSendMessage} className="button">
          <span></span>Send
        </button>
      </div>
    </div>
  );
};

export default page;
