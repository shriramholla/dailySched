//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-shriram:Test123@cluster0-m3rsg.mongodb.net/dailySched" , {useNewUrlParser: true});
const itemsSchema = {
  name: String
};
const listSchema = {
  name: String,
  item: [itemsSchema]
}
const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome!"
});
const item2 = new Item({
  name: "Click the + icon to add a new Task"
});
const item3 = new Item({
  name: "<-- Click this to Delete a Task"
});

const defaultItems = [item1, item2, item3];



app.get("/", function(req, res){
  //   let day = date.getDate();
  Item.find({}, function(err, found){
    if(found.length==0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }
        else {
          console.log("Tasks have been Added!");
          res.render("list", {listTitle: "Today",newListItems: defaultItems});
        }
      });
    }
    else {
      res.render("list", {listTitle: "Today",newListItems: found});
    }

  });

});

app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
        //console.log("Doesn't Exist");
        const list = new List({
          name: customListName,
          item: defaultItems
        });
        list.save();
        //res.render("list", {listTitle: foundList.name, newListItems: foundList.item});
        res.redirect("/" + customListName);
      }
      else {
        //console.log("Exists");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.item});
      }
    }


});
})


app.post("/", function(req,res){
  itemName = req.body.newItem;
  const listName = req.body.button;

  const item = new Item({
    name: itemName
})
if (listName === "Today"){
  item.save();
  res.redirect("/");
}else {
  List.findOne({name:listName}, function(err, foundItem){
    foundItem.item.push(item);
    foundItem.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
  var deletedId = req.body.checkbox;
  var listName = req.body.listName;
  if(listName === "Today"){
      Item.findByIdAndRemove(deletedId,function(err){
        if (err){
          console.log(err);
        }
        else {
          console.log("deleted");
        }
      })
      res.redirect("/");
    }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {item: {_id: deletedId}}}, function(err, foundItem){
      if (!err){
      res.redirect("/" + listName);
    }
  });
  }
});
let port = process.env.PORT;
if (port == null || port == ""){
  port = 3000
}

app.listen(port, function(){
  console.log("Server started on port 3000.");
});
