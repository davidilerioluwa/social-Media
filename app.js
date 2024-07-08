require("dotenv").config()
const express= require("express")
const cors= require("cors")
// const logger=require("morgan")
const bodyParser = require("body-parser")
const mongoose=require("mongoose")
const passport=require("passport")
const session=require("express-session")
const passportLocal=require("passport-local-mongoose")
const path=require("path")
const fs=require("fs")
const multer=require("multer")
const { error } = require("console")




app=express()

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))
app.use(express.static(path.join(__dirname,"build")))
app.get("/*",(req,res)=>{
    res.sendFile(path.join(__dirname,"build","index.html"))
})
// app.use(logger("dev"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
   
}))



// set up database

mongoose.connect("mongodb://localhost:27017/socialDB", {useNewUrlParser:true})
// mongoose.connect("mongodb+srv://davidilerioluwa:ilerioluwa@cluster0.iheez.mongodb.net/socialDB")
// to set up the users database
var shopSchema= new mongoose.Schema({
    username: String,
    password:String,
    Cart:[Object],
    userInfo:{
        firstname: String,
        lastname:String,
        dob: String,
        profilePicture:Object
    },
 
})

shopSchema.plugin(passportLocal)

let User= new mongoose.model("user", shopSchema)
// to set up posts database
const postSchema= new mongoose.Schema({
_id: String,
postText: String,
postPicture:[Object],
poster: String,
likes: [Object]
})

const Post= new mongoose.model("post", postSchema)



// set up passport
app.use(passport.initialize())
app.use(passport.session())

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// set up multer
const storage= multer.diskStorage({
destination: "./images"  ,
filename: (req,file,cb)=>{cb(null,file.originalname)}
})
const upload=multer({storage: storage})











app.get("/",(req,res)=>{
    if(req.isAuthenticated==true){
        res.send("authenticated")
    }else{
        res.send("not authenticated")
    }
})





app.get("/api",(req,res)=>
 {
    //  console.log(username)
//     res.send({message: "hello from server",
//     isAuthenticated:isAuthenticated,
// username:username,
// creatingPost:creatingPost
// })
res.send("hhh")
 }
    )
app.post("/api",(req,res)=>(
    res.send({message: "hello from server",
        isAuthenticated:req.isAuthenticated(),
    username:req,
    creatingPost:creatingPost
    })
))






app.post("/create",upload.single("file"),(req,res,next)=>{
 const   firstName= req.body.firstname
 const   lastName= req.body.lastname
const    dob=req.body.dob
 const  username= req.body.username
const  password= req.body.password
  const profilePicture={
    data: fs.readFileSync(path.join(__dirname+"/images/"+req.file.originalname)),
    contentType:req.file.mimetype
}

    
 const   userInfo=  {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        profilePicture: profilePicture,
        dob:dob
    }



 User.register({username: username}, password, function(err,user){
  
     if(err){
         console.log(err);
         
     } else{
        passport.authenticate("local")(req,res,function(){

            User.update({username:username},{userInfo:userInfo},(err)=>{
                if(err){console.log(err)}
            else{console.log("sucessful")}
            })
            isAuthenticated=true 
            res.send(isAuthenticated)
        })
         
     }
  
 })

})

app.post("/login", function(req,res){
   
    firstName= req.body.firstName
      lastName= req.body.lastName
     username= req.body.username
  password= req.body.password

const user =new User({
    username:username,
    password:password
})
req.login(user, function(err){
    if(err){
        console.log(err)
    } else{
        passport.authenticate("local")(req,res,function(){
               passport.authenticate("local")(req,res,function(){isAuthenticated=true 
                
                res.send({posting:"posted",isAuthenticated:isAuthenticated})
            }) 
        })
    }})

}) 
app.post("/logout",(req,res)=>{
res.send("logged out")
isAuthenticated=false

})


// add friend
app.post("/addFriend",(req,res)=>{
    console.log(req.body.friendName)
User.update({username:username},{"$push": {friends:{_id:req.body.friendName}}},(err)=>{
    if(err){console.log(err)}
    else{console.log("friend added successfully")}
})
})
// show friend
app.get("/showFriends", (req,res)=>{      
        
        //   to find all the users friends
            User.find({username:username},(err,user)=>{
                if(err){console.log(err)}
                else{
                    // console.log(user[0].friends.length)
                    var friends=user[0].friends
                    // to find the post by each of the friends
                    if(friends.length===0){
                        console.log("no friends")
                        res.send("no friends")}
                    else{
                        // console.log("j")
                        friendsArray=[]
                        friends.forEach(friend => {
                            User.find({username:friend._id},(err,friends)=>{
                                
                                if(err){console.log(err)}
                                else{
                                    // console.log("h")
                                    friendsArray=friendsArray.concat(friends)
                                    res.send({friends:friendsArray})
                                }
                            })      
                        })
                    }
                }
            })


})







app.post("/setCreatePost",(req,res)=>{creatingPost=req.body.creatingPost
    console.log(creatingPost)
})



app.get("/getUser",(req,res)=>{
    User.find({username:username},(err,user)=>{
        // console.log(user[0].userInfo.profilePicture.contentType)
        res.send({user:user[0]})
    })
})
app.post("/getRandomUser",(req,res)=>{
    User.find({username:req.body.randomUser},(err,user)=>{
        console.log(req.body.randomuser)
        res.send(user[0])
    })
})


app.get("/getPost",(req,res)=>{
    // to find all the user's post
  var allPosts=[]
  Post.find({poster:username},(err,posts)=>{
      
    if(err){
        console.log(err)
    }else{
      allPosts=posts
    //   to find all the users friends
        User.find({username:username},(err,user)=>{
            if(err){console.log(err)}
            else{
                // console.log(user[0].friends.length)
                var friends=user[0].friends
                // to find the post by each of the friends
                if(friends.length===0){res.send({images:allPosts})}
                else{
                    friends.forEach(friend => {
                        Post.find({poster:friend._id},(err,friendPosts)=>{
                            if(err){console.log(err)}
                            else{allPosts=allPosts.concat(friendPosts)
                            res.send({images:allPosts})
                            }
                        })      
                    })
                }
            }
        })

    }
})

   
})




app.post("/createPost",upload.single("file"),(req,res,next)=>{
        // to actually create post
    const obj=new Post({
        _id: req.body._id,
       poster: req.body.poster,
       postText: req.body.postText
    })
    const postPicture={
        data: fs.readFileSync(path.join(__dirname+"/images/"+req.file.originalname)),
        contentType:req.file.mimetype
    }
console.log(req.body)
    Post.create(obj,(err,item)=>{
    if(err){
        console.log(err)
    }else{
        // to add image to created post
        Post.update({_id: req.body._id},{"$push":{postPicture:postPicture}},(err)=>{
            if(err){console.log(err)
            }else{
                // to add the post to the list of posts created by the user
                User.update({username:req.body.poster},{"$push":{posts:req.body._id}},(err)=>{
                    if(err){
                        console.log(err)
                    }else{
                        res.send("uploaded")
                        console.log("image uploaded sucessfully")
                    }
                }
                )
            }
        })
    }
    
    
    })
})




app.listen(process.env.PORT||3001,()=>console.log("server running"))
var name=""
var api=""
var isAuthenticated=false
var username=""
var creatingPost=false
  // "proxy": "http://localhost:3001",

