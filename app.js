import dotenv from "dotenv"
dotenv.config({path:"backend/config/.env"});
import passport from "passport";
import express from "express";

const app = express();

import querystring from 'querystring';
import cors from 'cors';
console.log(cors)

const corsOptions = {
    origin: 'https://btp-frontend-beryl.vercel.app', // use your actual domain name (or localhost), using * is not recommended
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials: true
  };
 
 app.use(cors({corsOptions})); 

import User from "./Views/user.js";
import msRoute from "./Controllers/studentLoginController.js";

import sessions from "express-session";
import cookieParser from "cookie-parser";

import cokkieSession from "cookie-session";

import student from "./Views/student.js";
import project from "./Views/projects.js";


app.use(express.json());

import mongoose from "mongoose";
import Student from "./Models/Student.js";

//mongoose connection
import connectDatabase from "./config/database.js"
import authRouter from "./Views/msAuth.js";
connectDatabase();

const clientId = process.env.MICROSOFT_GRAPH_CLIENT_ID;
console.log(clientId)
const tenantId = process.env.MICROSOFT_GRAPH_TENANT_ID;
const clientSecret = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;

const redirectUri = 'https://btp-frontend-beryl.vercel.app/studentallproject';
const scopes = 'user.read';


app.use("/user",User);

app.get('/api/getToken', (req, res) => {
    const authorizationUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`;
    const queryParams = querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
    });
  
    const authorizeUrl = `${authorizationUrl}?${queryParams}`;
    res.redirect(authorizeUrl);
  });


const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));



app.use(passport.initialize());
app.use(passport.session());

// app.use("",msRoute);
app.use(authRouter)
app.use("/student",student)
app.use("/project",project);

app.get("/",async (req,res)=>{
    if(req.user){
        const student = await Student.findById(req.user._id);
        res.send(student);   
    }
    else{
        res.send("Hey");
    }
})



app.listen(process.env.PORT,(req,res,err)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("Server listening on PORT ",5000);
    }
})