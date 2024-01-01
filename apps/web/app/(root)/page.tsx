"use client";
import { useState } from "react";
import "../styles.css";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const Home = () => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomAction, setRoomAction] = useState("create");
  const router = useRouter();
  
  const handleJoin = () => {
    // Perform any necessary validation before redirecting
    if (name.trim()) {
      if (roomCode.trim()) {
        // Redirect to the chat page with the name as a query parameter
        if (roomAction === "create") {
          // If the "create" radio button is selected
          toast.success("New Chat Room Created: " + roomCode);
        } else if (roomAction === "join") {
          // If the "join" radio button is selected
          toast.success("Joined Chat Room: " + roomCode);
        }

        localStorage.setItem("userName", name);
        localStorage.setItem("roomCode", roomCode);
  
        setTimeout(() => {
          router.push(`/chat?name=${encodeURIComponent(name)}&roomCode=${encodeURIComponent(roomCode)}`);
        }, 800);
      } else {
        toast.error("Please Enter a Room Code.");
      }
    } else {
      toast.error("Please Enter a Name.");
    }
  };

  return (
    <div className="container">
      <div className="formContainer">
        <h1 className="heading">Chat App</h1>
        <div className="inputContainer">
          <label className="lbl">
            Enter Your Name:
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </label>
          <br />
          <label className="lbl">
            <div className="radioContainer">
              <label>
                <input
                  type="radio"
                  value="create"
                  checked={roomAction === "create"}
                  onChange={() => setRoomAction("create")}
                />
                Create New Room
              </label>
              <label>
                <input
                  type="radio"
                  value="join"
                  checked={roomAction === "join"}
                  onChange={() => setRoomAction("join")}
                />
                Join Room
              </label>
            </div>
          </label>
          <br />
          {roomAction === "join" && (
            <input
              type="text"
              placeholder="Enter chat room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="input"
            />
          )}
          {roomAction === "create" && (
            <input
              type="text"
              placeholder="Enter a new code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="input"
            />
          )}
        </div>
        <button onClick={handleJoin} className="joinButton">
          Join
        </button>
      </div>
    </div>
  );
};

export default Home;
