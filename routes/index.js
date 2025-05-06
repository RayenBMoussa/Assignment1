const express = require('express');
const router = express.Router();
const {registerUser,loginUser,authenticated} = require("../public/js/userAuth");
const Joi = require('joi');


const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

router.get('/', (req, res) => {
  
  res.render('landing'); 
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/register',async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    // res.redirect("/login");
    return res.status(400).send("Injection attack detected" + error.message);
  }
  await registerUser(req, res);
});

router.post('/login',loginUser);


router.get('/dashboard', authenticated, (req, res) => {
  const catImages = ['funny1.gif', 'funny2.gif', 'funny3.gif'];
  const randomIndex = Math.floor(Math.random() * catImages.length);
  const selectedCatImage = `/images/${catImages[randomIndex]}`;
  res.render('dashboard', { user: req.user,catImage:selectedCatImage }); 
});



router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout error');
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});




module.exports = router;
