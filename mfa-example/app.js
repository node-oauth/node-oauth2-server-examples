const app = require('express')();
const session = require('express-session');

const routes = require('./routes');

const start = () => {

    // setup in memory session, but only for routes relating to auth so /api
    app.use('/api', session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    }))

    // set the routes
    routes(app);

    // middleware handles errors
    app.use((error, req, res, next) => {
        res.status(500);
        return res.json({ message: error.message });
    })

    // run the server
    app.listen(5000, () => {
        console.log("OAuth2 Server is running on port 5000")
    })


}

start();
