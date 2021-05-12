var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@connectplacecluster.0gdr9.gcp.mongodb.net/aspects?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var database;

client.connect(err => {
  const collection = client.db("aspects").collections("contents");
  database = client.db();
  console.log("Database connection done.");

});


/* GET home page. */
router.get('/', function(req, res, next) {
  database.collection("contents").find({}).toArray(function (error, data) {
    if (error) {
      manageError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(data);
    }
  });

  // res.render('index', { title: 'Express' })
});
 router.post('/', function(req, res, next) {
   // console.log(req.body.userid)
   database.collection("history").find({"userid":req.body.userid}).sort({$natural: 1}).toArray(function (error, data) {
     console.log(data);
     if(data.length === 0 ){
       database.collection("history").insertOne({"userid":req.body.userid, "index":1, "col": 1 })
       database.collection("contents").find({"index":"1"}).toArray(function (error2, data2) {
         var responseJson= {"value":data2.col1}
         console.log(responseJson)
         res.status(200).json(responseJson);

       })

     } else {
       console.log( Number(data[0].index) + 1)
       var colString =("col" + (Number(data[0].col) ))

       database.collection("contents").find({"index":( Number(data[0].index) + 1 )} ).toArray(function (error2, data2) {
         console.log(data2)
         console.log(colString + " - "+ data2[0][colString])
         if (data2[0].col1 === "loopback"){
           console.log("print Inside LoopBack")
           database.collection("contents").find({"index":1} ).toArray(function (error3, data3) {
             console.log(data3)
             var responseJson= {"value":data3[0].col1}
             console.log("responseJson : " + responseJson.value)
             database.collection("history").updateOne({"userid":req.body.userid}, { $set:{"index":  1}});
             console.log(database.collection("history").find({}))
             res.status(200).json(responseJson);

           })
         }else {
           var responseJson= {"value":data2[0].col1}
           console.log("responseJson : " + responseJson.value)
           database.collection("history").updateOne({"userid":req.body.userid}, { $set:{"index": (Number(data[0].index) + 1)}});
           console.log(database.collection("history").find({}))
           res.status(200).json(responseJson);

         }


       });

       }
   });

 });

router.post('/no', function(req, res, next) {
  // console.log(req.body.userid)
  database.collection("history").find({"userid":req.body.userid}).sort({$natural: 1}).toArray(function (error, data) {

    database.collection("history").updateOne(
        { userid: req.body.userid },
        { $set: { "index": (Number(data[0].index) + 1),"col": (Number(data[0].col) + 1) } },
        { upsert:true }
    )

    database.collection("contents").find({"index": 1 } ).toArray(function (error2, data2) {
      var colString =("col" + (Number(data[0].col) + 1 ))
      var responseJson= {"value":data2[0][colString]}

      res.status(200).json(responseJson);
    })



  });

});

module.exports = router;
