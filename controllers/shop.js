const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  //find when used with mongoose gives an array. Now if we know that we will query large amounts of data, then we should turn this into a cursor or manipulate find to limit the set of data this retrives
  Product.find() //find works a bit different in mongoose. It does not return a cursor instead it does gives us a product. . cursor() method can be used to get access to the cursor
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //findById method is also defined by mongoose and also we can pass string to findById and it will automatically convert it into ObjectId
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId') //enter path and it will return a user in which cart field will have items array which will contain the entire product since we used populate 
    .execPopulate() //populate does not return a promise so calling then on it would not work so we need to chain execPopulate() and then we will get a promise
    .then(user => {
      // console.log(user.cart.items); //uncomment on see what it is returning
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      })
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postCart = (req, res, index) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(1);
      console.log(req.user);
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
}

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    }).catch(err => {
      console.log(err);
    });
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: {
            ...i.productId._doc //productId will be an object with lot of meta data attached to it even though we can't see that while console logging it. But with ._doc we can really access to just the data that's in there and with the spread operator inside of a new object we pull out all the data in that document we retrieved and store it in a new object which we save here as a product.
          }
          // product: i.productId //This was just creating field for object id
        }
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user //or req.user.id
        },
        products: products
      });
      console.log(order);
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    //we write the below code in the above method so that we get directed once the cart gets cleared 
    // .then(result => {
    //   return req.user.clearCart();
    //   res.redirect('/orders');
    // })
    .catch(err => {
      console.log(err);
    })
}

exports.getOrders = (req, res, next) => {
  Order.find({ //userId is equal to the logged in user
      'user.userId': req.user._id //when we are entering the path in find we should put it as a string
    })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      console.log(err);
    })

};