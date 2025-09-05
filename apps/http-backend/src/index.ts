import express from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from "@repo/common/types";
import {prismaClient} from "@repo/db/client";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());

app.post("/signup", async (req,res) => {

    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success) {
      res.json({
        message: "Invalid input"
      });

      return;
    }

    try {
      const password = data.data.password;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = prismaClient.user.create({
        data: {
          email: data.data.username,
          password: hashedPassword,
          name: data.data.name
        }
      });

      res.json({
        //@ts-ignore
        userId: user.id
      })
    } catch(e) {
      res.json({
        message: "User already exists."
      });
    };
});

app.post("/signin", async (req,res) => {


    const data = SignInSchema.safeParse(req.body);
    if(!data.success) {
      res.json({
        message: "Invalid input"
      });

      return;
    }

    try {
      const user = await prismaClient.user.findUnique({where : {email: data.data.username}});
      if(!user) {
        res.json({
          message: "User does not exist"
        });
        return;
      };

      const isMatch = await bcrypt.compare(data.data.password, user?.password);
      if(!isMatch) {
        res.json({
          message: "Wrong password"
        });
        return;
      };

      const token = jwt.sign({
        userId: user?.id
      }, JWT_SECRET);

      res.json({
        token
      });
      
    } catch(e) {
      res.json({
        message: "Something went wrong"
      })
    }
});

app.post("/room", middleware, async (req,res) => {


    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success) {
      res.json({
        message: "Invalid input"
      });

      return;
    }

    res.json({
      roomId: "123"
    })
  
  });

  app.listen(3001);