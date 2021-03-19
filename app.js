const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('6054deb26b50c74ba4295395')
        .then(user => {
            //And now we are storing the user in our request and also this user on the right hand side is a full mongoose model so we can all this mongoose model methods on that user object and also on the user object that we store on the left hand side
            //so for every incoming request we will get this user
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//mongoose will manage the one connection behind the scene for us
mongoose.connect('mongodb+srv://DNM14:Dixit@123@cluster0.xtbxa.mongodb.net/shop?retryWrites=true&w=majority', {
        useUnifiedTopology: true,
        useNewUrlParser: true //this is imp
    })
    .then(result => {
        //we are using this so that the user document does not created everytime when the server gets restarted
        User.findOne().then(user => { //findOne if we don't pass any argument will always return the first document it finds
            if (!user) {
                const user = new User({
                    name: 'DM',
                    email: 'dm@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save(); //This all will be done when we call our server
            }
        })
        app.listen(3000);
    }).catch(err => {
        console.log(err);
    });