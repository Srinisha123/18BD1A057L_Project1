const express=require("express");
const app=express();
let server = require("./server");
let middleware = require("./middleware");
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
const MongoClient=require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'hospitalmanagement';
let db
MongoClient.connect(url,{ useUnifiedTopology: true },(err, client)=>{
    if (err) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);
});
app.get('/hospital', middleware.checkToken,function (req,res) {
    console.log("Fetching data from Hospital Collection");
    var data = db.collection('hospital').find().toArray().then(result => res.json(result));
});
app.get('/ventilator',middleware.checkToken,(req,res) =>{
    console.log("ventilators Information");
    var data = db.collection('ventilator').find().toArray().then(result => res.json(result));
});
app.post('/searchventbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var data = db.collection('ventilator')
    .find({ 'status':status}).toArray().then(result=>res.json(result));
});
app.post('/searchventbyname',middleware.checkToken,(req,res)=>{
    var name = req.query.name;
    console.log(name);
    var  data = db.collection('ventilator')
    .find({ 'name':new RegExp(name, 'i')}).toArray().
    then(result => res.json(result));
});
app.post('/searchhospbyname',middleware.checkToken,(req,res)=>{
    var name = req.query.name;
    console.log(name);
    var  data = db.collection('hospital')
    .find({ 'name':new RegExp(name, 'i')}).toArray().
    then(result => res.json(result));
});

app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventilatorid  = {ventilatorid:req.body.ventilatorid};
    console.log(ventilatorid);
    var newvalues = {$set: { status: req.body.status}};
    db.collection("ventilator").updateOne(ventilatorid,newvalues,function(err,result){
        res.json('1 document updated');
         if (err) throw err;
    });
});
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorid=req.body.ventilatorid;
    var status=req.body.status;
    var name=req.body.name;

    var item=
    {
        hId:hId, ventilatorid:ventilatorid, status:status,name:name
    };
    db.collection('ventilator').insertOne(item, function (err,result){
        res.json('Item Inserted');
    });
});
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var  ventilatorid = req.query.ventilatorid;
    var query1 = {ventilatorid:ventilatorid};
    console.log(ventilatorid);

    db.collection('ventilator').deleteOne(query1,function(err,result){
       
        res.json("1 document deleted");
        if (err) throw err;
    });
});
app.listen(1100);