//นำเข้า module
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const myAllBooks = require('./models/book');
const myUser = require('./models/user');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const adminRouter = require('./routes/admin')
const testRouter = require('./routes/test');


//สร้าง instance
const app = express();

//connect to mongo
var dbURI = 'mongodb://localhost:27017/project'

//กำหนดให้มีการใช้ ejs ในการสร้าง view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//รอรับ request จาก browser (client)
mongoose.connect(dbURI)
.then((result) => app.listen(5500))
.catch((err) => console.log(err))

//เรียกใช้ middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: 'strict',
    }
  })
)

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/test', testRouter);


//request
app.get('/', function (req, res, next) {
  res.redirect('/users/login');
});

//request



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
