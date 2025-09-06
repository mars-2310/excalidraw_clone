import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt, { JwtPayload } from "jsonwebtoken";
import {prismaClient} from "@repo/db/client";

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const wss = new WebSocketServer({ port: 8080});

const users: User[] = [];

function checkUser(token: string) {
  try {
    const decoded = jwt.verify(token as string, JWT_SECRET);
  
    if(!decoded || !(decoded as JwtPayload).userId) {
      return null;
    }

    return (decoded as JwtPayload).userId;
  } catch(e) {
    return null;
  }
}

wss.on('connection', function connection(ws, request) {

  const url = request.url;

  if(!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if(!userId) {
    ws.close();
    return;
  };

  users.push({
    ws,
    rooms: [],
    userId
  });
  
  ws.on('message', async function message(data) {
    const parsedData = JSON.parse(data.toString());

    if(parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    };

    if(parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if(!user) return;
      user.rooms.filter(x => x === parsedData.room);
    };

    if(parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          userId,
          message
        }
      })

     users.forEach(user => {
      if(user.rooms.includes(roomId)){
        user.ws.send(JSON.stringify({
          type: "chat",
          message: message,
          roomId
        }));
      }
     })
    }
  });
});