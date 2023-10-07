var express = require('express');
var router = express.Router();
const myUser = require('../models/user');
const myAllBooks = require('../models/book');
const myRent = require('../models/rentBook');

const { DateTime } = require("luxon");


const multer = require('multer')
const fs = require("fs")
const Storage = multer.diskStorage({
     destination: 'public/images',
     filename: (req, file, cb) => {
          cb(null, file.originalname)
     }
})
const upload = multer({
     storage: Storage
})

//---------------------------------------------------------------------

router.get('/', function (req, res, next) {
     myAllBooks.find()
          .then((result) => {
               res.render('allbooks', { books: result })
          })
          .catch((err) => {
               console.log(err)
          })
});

router.get('/add', function (req, res, next) {
     res.render('addbook');
});

router.post('/insert', upload.single('image'), (req, res) => {
     const addBook = new myAllBooks({
          bookid: req.body.bookid,
          title: req.body.title,
          author: req.body.author,
          category: req.body.category,
          publisher: req.body.publisher,
          synopsis: req.body.synopsis,
          amount: req.body.amount,
          price: req.body.price,
          image: req.file.filename,
          status: req.body.status
     })
     addBook.save()
          .then((result) => {
               res.redirect('/books')
          })
          .catch((err) => {
               console.log(err)
          })
});

router.get('/editBook/:id', function (req, res, next) {
     const id = req.params.id
     myAllBooks.findById(id)
          .then((result) => {
               res.render('editbook', { books: result })
          })
          .catch((err) => {
               console.log(err)
          })
});

router.post('/updateBook/:id', upload.single('image'), (req, res) => {
     const id = req.params.id;

     let image;
     if (!req.file) {
          image = req.body.image;
     } else {
          image = req.file.filename
     }

     const update_book = {
          bookid: req.body.bookid,
          title: req.body.title,
          author: req.body.author,
          category: req.body.category,
          publisher: req.body.publisher,
          synopsis: req.body.synopsis,
          amount: req.body.amount,
          price: req.body.price,
          image: image,
          status: req.body.status
     }

     myAllBooks.findByIdAndUpdate(id, update_book, { new: true })
          .then((result) => {
               res.redirect('/books')
          })
          .catch((err) => {
               console.log(err)
          })
})

router.delete('/delbook/:id', (req, res) => {
     var id = req.params.id

     myAllBooks.findByIdAndDelete(id)
          .then((result) => {
               res.json({ redirect: '/books' })
          })
          .catch((err) => {
               console.log(err)
          })
});

router.get('/request', async (req, res) => {
     myRent.find({ statusPayment: 0 })
          .then((result) => {
               res.render('request', { rents: result })
          })
          .catch((err) => {
               console.log(err)
          })
});

router.get('/confirmRent/:id', async (req, res) => {
     const id = req.params.id

     const update_payment = {
          statusPayment: 1
     }

     try {
          await myRent.findByIdAndUpdate(id, update_payment, { new: true });
          res.redirect('/books/request');
     } catch (error) {
          console.error(error);
          res.status(500).send('Failed to update statusPayment.');
     }
});

router.get('/removermRent/:id', async (req, res) => {
     const id = req.params.id

     try {
          await myRent.findByIdAndRemove(id);

          res.redirect('/books/request');
     } catch (error) {
          console.error(error);
          res.status(500).send('Failed to update statusPayment.');
     }
});

router.get('/renting', function (req, res, next) {
     myRent.find({ statusPayment: 1, statusRent: 0 })
          .then((result) => {
               res.render('renting', { renttt: result })
          })
          .catch((err) => {
               console.log(err)
          })
});

router.get('/return/:id', async (req, res) => {
     const id = req.params.id
     try {
          const userId = req.session.userID;
          const userData = [await myUser.findById(userId).populate('cart.book')];
          const books = await myAllBooks.find();
          const rentData = await myRent.findById(id);

          console.log(rentData)

          for (const cartItem of rentData.cart) {
               const bookToUpdate = books.find(book => book.title === cartItem.book);
               if (bookToUpdate) {
                    bookToUpdate.amount += cartItem.quantity;
                    bookToUpdate.save();
               }
          }

          const update_payment = {
               statusRent: 1
          }

          try {
               await myRent.findByIdAndUpdate(id, update_payment, { new: true });
               res.redirect('/books/renting');
          } catch (error) {
               console.error(error);
               res.status(500).send('Failed to update statusPayment.');
          }

          // res.redirect('/books/renting');
     } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'เกิดข้อผิดพลาดในการแสดงตะกร้า' });
     }
});


module.exports = router;
