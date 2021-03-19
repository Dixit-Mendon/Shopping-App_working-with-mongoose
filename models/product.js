const mongoose = require('mongoose');

const Schema = mongoose.Schema; //here schema is a constructor

//Now we want to use the user model with product model
//Since every product must be assigned to a user
const productSchema = new Schema({
  //In this we define data schema of our product
  //In the mongodb module, he mentioned that it is schema less. So why do we start creating schema? So the idea is once we have the flexibility of not being restricted to a particular schema we often will have a certain structure in the data we work with and therefore mongoose wants to give you the advantage of focusing on just the data but for that it needs to know how our data looks like
  //And therefore we define such a schema for the structure our data will have but inp we can still deviate from this i.e (we can also store which does not have a title in this case) but using required we make it mandatory and thereby give up some of the flexilibity we had before and we force all objects to have the title. So having some kind of schema makes sense but we have the flexibilty to deviate from that
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: { //this will actually be a reference to the user
    type: Schema.Types.ObjectId, //We know that we will store userId here but just bcz the type is ObjectId this is not obvious since it could be any objectId of any object
    ref: 'User', //ref takes a String where we tell mongoose which other mongoose model is related to the data in that field
    required: true
  }
});

//In the next step we will define model based on the schema and then create an object based on the model and work with that.

module.exports = mongoose.model('Product', productSchema);
//model is important for mongoose behind the scene to connect a schema(a blueprint) with a name.
//Here Product will get converted to lowercase and plural form to form a collection name


// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     // this._id = new mongodb.ObjectId(id); //using this makes this._id defined in the save method bcz when we don't pass id it is undefined but this._id get defined bcz an object is created uding ObjectId method
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       //Update the product
//       dbOp = db.collection('products').updateOne({
//         // _id: new mongodb.ObjectId(this._id) //Here there is no problem 
//         _id: this._id
//       }, {
//         $set: this //But here we storing id as a string
//       });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }

//     return dbOp
//       .then(result => {
//         // console.log(result);
//       }).catch(err => {
//         console.log(err);
//       });
//   }
//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products')
//       .find() //find does not immediately return a promise though, instead it returns a so called cursor. A cursor is a object provided by mongodb which allows us to go through our elements/documents step-by-step bcz theoretically find could return millions of documents and we don't want to transfer it over the wire all in once so find gives us a handle which allows us to tell mongodb ok give me the next document ok give me the next document and so then. So there is a toArray method to tell mongodb to get all documents and turn them into an array(But this must only be used if we talking about only 100 documents otherwise it is better to implement pagination) which then returns a promise
//       .toArray()
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => {
//         console.log(err)
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     //find can take javascript object as parameter which acts as a filter
//     //find will still give a cursor since mongodb does not know that I will only get one
//     return db.collection('products')
//       .find({
//         _id: new mongodb.ObjectId(prodId)
//         // cannot read property title of null. _id is a ObjectId thing and not just string(Mongodb stores data in BSON format). i.e. ObjectId is an object provided by mongodb. 
//         //In the above step if we try to compare string with object of ObjectId, we get the above error. Hence we are passing ObjectId object for comparison instead of just string.
//       })
//       .next() //In this case it will give the next i.e. the last document that was returned by find
//       .then(product => {
//         console.log(product);
//         return product;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
//   //For deleting we can use different methods, we can add delete method to the product class and then we can make new product object and use delete on that. But we are using static method
//   static deleteById(prodId) {
//     const db = getDb();
//     return db.collection('products').deleteOne({
//         _id: new mongodb.ObjectId(prodId) //I don't got why we are using here new mongodb.ObjectId(prodId) since we are already doing that in the constructor
//       }) //deleteOne deletes the first element which satisfies the query
//       .then(result => {
//         console.log('Deleted');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Product;