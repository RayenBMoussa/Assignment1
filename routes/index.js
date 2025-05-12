const express = require('express');
const router = express.Router();
const {registerUser,loginUser,authenticated,adminOnly,getAllUsers,createAdminUser,promoteUser,demoteUser} = require("../public/js/userAuth");
const Joi = require('joi');

 
const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

router.get('/', (req, res) => {
  
  res.render('register',{ activePage: "register",
    homePage: "dashboard",error: null }); 
});

router.post('/register',async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).render('register', {
      error: "Injection attack detected: " + error.message
    ,activePage: "register",
    homePage: "dashboard"});  }
  await registerUser(req, res);
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});



router.post('/login',loginUser);


router.get('/dashboard', authenticated, (req, res) => {
  const catImages = ['funny1.gif', 'funny2.gif', 'funny3.gif'];
  res.render('dashboard', { user: req.user,catImages,activePage: 'adminDashboard' , homePage: "dashboard"}); 
});



router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Logout error');
    res.clearCookie('connect.sid');
    res.redirect('login');
  });
});

router.get("/adminDashboard", authenticated,adminOnly, getAllUsers,(req,res)=>{
  res.render("adminDashboard",{ activePage: 'adminDashboard', homePage: "dashboard" });
});

router.post('/promote/:id', adminOnly, promoteUser);

router.post('/demote/:id', adminOnly, demoteUser);


module.exports = router;
