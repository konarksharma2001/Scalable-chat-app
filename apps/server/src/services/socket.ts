import { Server } from "socket.io";
import Redis from "ioredis";
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

const pub = new Redis({
  host: "redis-55638ba-scalable-chat-app-konark.a.aivencloud.com",
  port: 21134,
  username: "default",
  password: "AVNS_eVVkifTmKjtxsQuQVS9",
});

const sub = new Redis({
  host: "redis-55638ba-scalable-chat-app-konark.a.aivencloud.com",
  port: 21134,
  username: "default",
  password: "AVNS_eVVkifTmKjtxsQuQVS9",
});

class SocketService {
  private _io: Server;
  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });
    sub.subscribe("MESSAGES");
  }

  get io() {
    return this._io;
  }

  public initListeners() {
    const io = this._io;
    console.log("Intitalized Socket Listeners");
    io.on("connect", (socket) => {
      console.log(`New Socket Connected`, socket.id);
      // Modify the event handler for 'event:message'
      // Event handler for 'event:message' event
      socket.on(
        "event:message",
        async ({ message, name, roomCode }: { message: string; name: string; roomCode: string }) => {
          console.log("New message Received:", message, "with ID:", socket.id, "with room code: ",roomCode);

          // Publish the message to Redis along with the name and roomCode
          await pub.publish("MESSAGES", JSON.stringify({ id: socket.id, message, name, roomCode }));

          // Broadcast the message to all clients in the room identified by roomCode
          io.to(roomCode).emit('message', { id: socket.id, message, name });
        }
      );
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("New Message from Redis: ", message);
        // Parse the message from Redis to extract the ID
        const parsedMessage = JSON.parse(message);

        // Emitting 'message' event with both ID, name, and the received message
        io.emit('message', { id: parsedMessage.id, name: parsedMessage.name, message: parsedMessage.message });


        // Removed database insertion to handle db overload & downtime
        // Sending the new message to Kafka as it has high throughput
        // await prismaClient.message.create({
        //     data: {
        //         text: parsedMessage.message,
        //     },
        // });
        await produceMessage(parsedMessage.message);
        console.log("Message Produced to Kafka Broker");
      }
    });
  }
}

export default SocketService;
