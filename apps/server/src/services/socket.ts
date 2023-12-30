import {Server} from 'socket.io';
import Redis from 'ioredis';
import prismaClient from './prisma';
import { produceMessage } from './kafka';

const pub = new Redis({
    host:'redis-55638ba-scalable-chat-app-konark.a.aivencloud.com',
    port: 21134,
    username:'default',
    password:'AVNS_eVVkifTmKjtxsQuQVS9',
});

const sub = new Redis({
    host:'redis-55638ba-scalable-chat-app-konark.a.aivencloud.com',
    port: 21134,
    username:'default',
    password:'AVNS_eVVkifTmKjtxsQuQVS9',
});

class SocketService{
    private _io: Server;
    constructor(){
        console.log("Init Socket Service...")
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            }
        });
        sub.subscribe("MESSAGES");
    }
    
    get io(){
        return this._io;
    }

    public initListeners(){
        const io = this._io;
        console.log("Intitalized Socket Listeners");
        io.on("connect", socket =>{
            console.log(`New Socket Connected`, socket.id);
            socket.on(`event:message`, async({message}:{message: string}) =>{
                console.log("New message Received:", message, "with ID:", socket.id);
                //publish this message to redis
                await pub.publish("MESSAGES", JSON.stringify({ id: socket.id, message }));
            })
        })

        sub.on('message', async (channel, message) => {
            if(channel === "MESSAGES"){
                console.log("New Message from Redis: ", message);    
                // Parse the message from Redis to extract the ID
                const parsedMessage = JSON.parse(message);

                // Emitting 'message' event with both ID and the received message
                io.emit('message', { id: parsedMessage.id, message: parsedMessage.message });

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