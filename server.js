var express=require('express')
var mongodb=require('mongodb').MongoClient
var app=express()

var database='mongodb://localhost:27017/dt'
var website="https://camper-api-project-swoozeki.c9users.io/"

app.get('/new/:protocol//:domain',function(req,res){
    var url=req.params.protocol+"//"+req.params.domain
    var isValid=url.search(/(http:\/\/|https:\/\/)www\..*\..+/gi)!=-1?true:false
    if(isValid){
        console.log("url queries, and valid!")
        mongodb.connect(database,function(err,db){
            if(err) throw err
            var randomBase=Math.floor(Math.random()*9999+1)
            var shortCollection= db.collection("shorturls")

            shortCollection.find({requrl: url}).toArray(function(err,doc){
                if(err) throw err
                if(!doc[0])
                    shortCollection.insertOne({
                        requrl: url,
                        shorturl: website+randomBase
                    },function(){
                        shortCollection.find({requrl:url}).toArray(function(err,doc){
                            if(err) throw err
                            res.end(JSON.stringify(doc))
                        })
                    })
                else res.end(JSON.stringify(doc))
            })
            
        })
    }

})

app.get('/:url',function(req,res){
    mongodb.connect(database,function(err,db){
        if(err) throw err
        var shortCollection= db.collection("shorturls")
        shortCollection.find({shorturl: website+req.params.url}).toArray(function(err, doc){
            if(err) throw err
            if(doc[0]) res.redirect(301,doc[0].requrl)
            else res.end("Invalid url")
        })
    })
})

app.use(express.static(__dirname))

app.listen(8080,function(){
    console.log("listening to port 8080")
})