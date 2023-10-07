const express = require('express');
const router = express.Router();
const myAllBooks = require('../models/book');
const myRent = require('../models/rentBook');


router.get('/', async (req, res) => {
  try {
    const books = await myRent.find();
    res.render('test', { books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ' });
  }
});





module.exports = router;
