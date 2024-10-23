import express from "express";
import multer from "multer";
import moment from "moment";
import cors from "cors";
import {Low} from "lowdb";
import {JSONFile} from "lowdb/node";
import {v4 as uuidv4} from "uuid";
import jwt from "jsonwebtoken";

const defaultData = {user: [], products: []};
const db = new Low(new JSONFile("db.json"), defaultData);
await db.read();


const upload = multer();

let whiteList = ["http://localhost:5500", "http://127.0.0.1:5500","http://localhost:3000", "http://127.0.0.1:3000" ];
let corsOptions = {
  credentials: true,
  origin(origin, callback){
    if(!origin || whiteList.includes(origin)){
      callback(null, true);
    }else{
      callback(new Error("不允許連線"));
    }
  }
}

const app = express();
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("首頁");
});


app.listen(3005, () => {
  console.log("server is running at http://localhost:3000");
  
})

function checkToken(req, res, next){
  let token = req.get("Authorization");

  if(token && token.indexOf("Bearer ") == 0){
    token = token.slice(7);
    jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
      if(error){
        return res.status(401).json({
          result: "fail",
          message: "驗證失敗，請重新登入。"
        })
      }
      req.decoded = decoded;
      next();
    })
  }else{
    return res.status(401).json({
      result: "fail",
      message: "沒有驗證資料，請重新登入。"
    })
  }
}