var express = require('express');
var router = express.Router();
const myUser = require('../models/user');
const bcrypt = require('bcrypt')
const myAllBooks = require('../models/book');


const { await } = require('await');
// const { response } = require('../app');

const hashPass = async(password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash
  }
  catch (err) {
    console.log(err)
  }
}

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/signup', function (req, res, next) {
  res.render('signup');
})

router.post('/signup', async (req, res) => {
  try {
    const password = await hashPass(req.body.password);
    const user = new myUser ({
      username: req.body.username,
      email: req.body.email,
      address: req.body.address,
      password: password, 
      is_admin: 0
    })
    const userData = await user.save()

    if(userData) {
      res.render('signup', {message: 'ลงทะเบียนสำเร็จ'})
    }
    else {
      res.render('signup', {message: 'ลงทะเบียนไม่สำเร็จ'})
    }

  } catch (error) {
    console.log(error.message)
  }
})

router.post('/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password

    const userData = await myUser.findOne({username: username })

    if(userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if(passwordMatch){
        if(userData.is_admin === 0){
          req.session.userID = userData._id
          req.session.userName = userData.username
          res.redirect('/home')
          console.log('เข้าสู่ระบบสำเร็จ')
        }
        else{
          req.session.userID = userData._id
          res.redirect('/books/')
        }
      }
      else{
        res.render('login', {message: 'อีเมลล์และรหัสผ่านของคุณไม่ถูกต้อง'})
      }
    }
    else{
      res.render('login', {message: 'อีเมลล์และรหัสผ่านของคุณไม่ถูกต้อง'})
      console.log('อีเมลล์และรหัสผ่านของคุณไม่ถูกต้อง')
    }
  }
  catch (error) {
    console.log(error.message)
  }
});

router.get('/edit', async(req, res, next) => {
  try{
    const userData = await myUser.findById({_id:req.session.userID})
    res.render('editprofile', { user:userData});
  }
  catch (error) {
    console.log(error.message)
}});

router.post('/update/:id', async (req, res) => {
  try{
    const updateID = await myUser.findById({_id:req.session.userID})
    myUser.findByIdAndUpdate(updateID, {
      username: req.body.username,
      email: req.body.email,
      address: req.body.address,
      password: req.body.password
    })
    .then((result) => {
      res.redirect('/home');
      console.log('อัพเดตข้อมูลสำเร็จ')
  })
  }
  catch{
    console.log(error.message)
  }
});

router.get('/logout',(req, res, next) => {
  try{
    if (req.session) {
      delete req.session;
    }
    res.redirect('/users/login')
  }
  catch (error) {
    console.log(error.message)
  }
});

// แสดงหน้ารายละเอียดหนังสือ
router.get('/detailbook', (req, res) => {
      res.render('detailbook')
});

// ดึง id ไปที่หน้ารายละเอียดหนังสือ
router.get('/detail/:id', (req, res) => {
  var id = req.params.id
  myAllBooks.findById(id)
     .then((result) => {
        res.render('detailbook',{result})
     })
     .catch((err) => {
        console.log(err)
     })
});



module.exports = router;
