const PROTO_PATH="./restaurant.proto";

require("dotenv").config({ path: "./config.env" });
const Menu = require('../models/Menu')
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));



var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");


var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

const {v4: uuidv4}=require("uuid");

const server = new grpc.Server();
var menu=[
    {
        id: "a68b823c-7ca6-44bc-b721-fb4d5312cafc",
        name: "Tomyam Gung",
        price: 500
    },
    {
        id: "34415c7c-f82d-4e44-88ca-ae2a1aaa92b7",
        name: "Somtam",
        price: 60
    },
    {
        id: "8551887c-f82d-4e44-88ca-ae2a1ccc92b7",
        name: "Pad-Thai",
        price: 120
    }
];

server.addService(restaurantProto.RestaurantService.service,{
    getAllMenu: async (_,callback)=>{
        menu = await Menu.find()
        callback(null, {menu});
    },
    get: async (call,callback)=>{
        let menuItem = await Menu.findById(call.request.id);

        if(menuItem) {
            callback(null, menuItem);
        }else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },
    insert: async (call, callback)=>{
        let menuItem=call.request;
        
        const menuObject = new Menu(menuItem);
        const newMenuObject = await menuObject.save();
        callback(null,newMenuObject);
    },
    update: async (call,callback)=>{
        let existingMenuItem = await Menu.findById(call.request.id);

        if(existingMenuItem){
            existingMenuItem.name=call.request.name;
            existingMenuItem.price=call.request.price;
            const updatedMenuItem = await existingMenuItem.save();
            callback(null,updatedMenuItem);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    remove: async (call, callback) => {
        let existingMenuItem = await Menu.findById(call.request.id);

        if(existingMenuItem){
            await existingMenuItem.remove()
            callback(null,{});
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "NOT Found"
            });
        }
    }
});

server.bind("127.0.0.1:30043",grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:30043");
server.start();