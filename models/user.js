const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    //For storing array of strings we use [String]
    //cart will be an embedded document
    cart: {
        //In items we are having array of documents
        items: [{
            productId: {
                type: Schema.Types.ObjectId, //we are telling mongoose that this we store an objectId because it will store a reference to a product
                ref: 'Product', //Here we are referring to product bcz we know that for every user in the cart items I will store products where I refer to some id and that id happens to refer to some product stored or defined through a Product model
                required: true
            }
            //Now we have relation setup through ref. Also we only need this when using references, when using embedded documents as we do with the cart we don't need to do anything bcz we use an embedded document which already has a kind of implicit relation that is managed inside of one document
            ,
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

//it has to be a function written like this so that the this keyword in there still refers to the Schema and to something else.
userSchema.methods.addToCart = function (product) { //this addToCart method will be called on a real instance based on that Schema (so on an object which will have a populated cart which will have an empty array of items or an array of items with items in there)
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString(); //Technically this are not string. So one soln to compare is to use == sign. Another soln is to use toString method
    });
    //returns -1 if not found
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id, //new ObjectId not required and mongoose will automatically wrap it in objectId
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };

    this.cart = updatedCart;
    console.log(this.cart);
    return this.save(); //this will update the cart as we already see it in editing product
}

userSchema.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = {
        items: []
    };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);


// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;
// //We are not calling it here we are just reference for it here in ObjectId constant here

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         this.cart = cart; //{items:[]}
//         this._id = id;
//     }
//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//         //we can again use then and catch here but we just return it so that whoever calls it can listen to that
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString(); //Technically this are not string. So one soln to compare is to use == sign. Another soln is to use toString method
//         });
//         //returns -1 if not found
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({
//                 productId: new ObjectId(product._id),
//                 quantity: newQuantity
//             })
//         }
//         const updatedCart = {
//             items: updatedCartItems
//         };
//         const db = getDb();
//         return db
//             .collection('users')
//             .updateOne({
//                 _id: new ObjectId(this._id)
//             }, {
//                 $set: {
//                     cart: updatedCart //this will not merge the elements in the items array, it will simply overwite the old cart with the new cart
//                 }
//             });
//         //This updateOne will return a promise
//     }

//     //Now getcart exists on the user who already has this cart property. This is the mongodb way of thinking about relations. We don't need to reach out to cart collections bcz there is no such collection
//     getCart() {
//         //return this.cart; //We can directly access  the cart property of the user from shop.js controller
//         //Now we will try to get fully populated cart
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         });
//         //$in takes an array (here array of ids) and therefore every id which is in the array will be excepted and will get back a cursor which hold references to all products with one of the ids mentioned in this array
//         return db.collection('products')
//             .find({ //this will give a cursor with all the matching products
//                 _id: {
//                     $in: productIds
//                 }
//             })
//             .toArray() //to get it converted to javascript array
//             .then(products => { //we will get all the product data that were in the cart
//                 // console.log(products);
//                 return products.map(p => {
//                     return { //we will return an object for every product with additional property of quantity
//                         ...p,
//                         quantity: this.cart.items.find(i => { //It necessary that we use arrow function here so that this inside this function refers to the over class (With normal function it would not)
//                             return i.productId.toString() === p._id.toString()
//                         }).quantity //the quantity method will get an object if we don't use quantity property here
//                     }
//                 })
//             })
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString(); //if return true means we want to keep the item
//         })
//         const db = getDb();
//         return db
//             .collection('users')
//             .updateOne({
//                 _id: new ObjectId(this._id)
//             }, {
//                 $set: {
//                     cart: {
//                         items: updatedCartItems //see this carefully
//                     }
//                 }
//             })
//     }

//     //this will not take any argument because the cart which will be passed as an order or as the data for the order is already registered on this user
//     //So we can add order to the user or we can also say that we want to store the order in new collection because we might have 1000 of orders and we don't want to embed them all into user object
//     addOrder() {
//         const db = getDb();
//         //since initally the orders were only containing the information related to the cart but no information about the user so we need to changee it
//         //return is necessary so that we can then outside the addcart
//         return this.getCart() //this gives an array of products which also has a quantity field
//             .then(products => {
//                 console.log(products);
//                 const order = { //If its outside the then block then it will get excuted early
//                     items: products, //since we are displaying the entire product information
//                     user: {
//                         _id: new ObjectId(this._id),
//                         name: this.name
//                         // email:this.email //but this will all end up in the orders collection as well as in the users collection
//                     }
//                 }
//                 return db.collection('orders').insertOne(order) //If we use {cart:this.cart } means we are storing an object in the database as object while if we use just this.cart as it is itself a object it will get stored as an array

//             }).then(result => {
//                 this.cart.items = []
//                 return db.collection('users').updateOne({
//                     _id: new ObjectId(this._id)
//                 }, {
//                     $set: {
//                         cart: {
//                             items: []
//                         }
//                     }
//                 });
//             })
//     }

//     getOrders() {
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find({
//                 'user._id': new ObjectId(this._id)
//             }).toArray();
//     }

//     static findById(userId) {
//         const db = getDb();
//         //.find({filter}) (return a cursor) this method will find all fitting users and then we use next() to get the first and the only element that matters to us.
//         return db.collection('users')
//             .findOne({ //If we are sure that we will get only one document then we can use this method. This will not return a cursor but immediately return that one element
//                 _id: new ObjectId(userId)
//             })
//             // .then(user => console.log(user)) //causing error cannot read property name of undefined
//             .catch(err => console.log(err));
//     }
// }

// //HW is to add functionality that when we delete products from the products it dhould get deleted from the cart also

// module.exports = User;