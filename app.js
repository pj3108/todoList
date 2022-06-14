//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-prateek:prateek3108@cluster0.ed0ln.mongodb.net/todolistDB");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemSchema);

const ListSchema={
  name: String,
  ListItems:[itemSchema]
};

const List=mongoose.model("List",ListSchema);

const item1=new Item({
  name:"Study"
});

const item2=new Item({
  name:"BTS"
});

const item3=new Item({
  name:"Prachi"
});

const defaultArray=[item1,item2,item3];

app.get("/", function(req, res) {

  Item.find(function(err,items){
    if(err)
    console.log("Error");
    else
   {
    if(items.length===0)
    {
      Item.insertMany(defaultArray,function(err){
        if(err)
        console.log("Error");
        else
        console.log("Default array to DB");
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: "Today", newListItems: items});
   }
  });


});

app.get("/:CustomListName",function(req,res){
  const CustomListName= _.capitalize(req.params.CustomListName);
  List.findOne({name: CustomListName},function(err,foundList){
    if(!err){
      if(!foundList){ // i.e, no list exist from this name, create a new one
        //create a new list
        const list=new List({
          name: CustomListName,
          ListItems: defaultArray
        });
      
        list.save();
        //now redirect
        res.redirect("/"+CustomListName);
      }
      else
      {
        //show existing list
        res.render("list",{listTitle: foundList.name, newListItems: foundList.ListItems})
      }
    }
  });
 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName==="Today")
  { item.save();

    res.redirect("/");}
    else{
      List.findOne({name: listName},function(err,foundList){
        foundList.ListItems.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }
 
});


app.post("/delete",function(req,res){
  const checkboxID = req.body.checkbox;
  const listName=req.body.listName;


  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkboxID,function(err){
      if(err)
      console.log("Error");
      else
      {
      console.log("Item Removed");
      res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull:{ListItems:{_id:checkboxID}}},function(err,foundList){
if(!err)
res.redirect("/"+listName);
    });
  }
 
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port=process.env.PORT;
if(port == null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
