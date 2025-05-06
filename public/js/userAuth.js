const User = require('./user');
const bcrypt = require('bcrypt');

    

const registerUser = async (req, res) => {
    const { email, name, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      // Log to check the data being inserted
      console.log("Registering user with email:", email, "and name:", name);
  
      await User.create({ email, name, password: hashedPassword });
      console.log("User created successfully");
      res.redirect('/login');
    } catch (err) {
      console.error("Error during user registration:", err.message);
      res.status(500).send('Error registering user.');
    }
  };
  

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) res.render('login', { error: 'Email/password combination is wrong' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('login', { error: 'Email/password combination is wrong' });
      }
      console.log("Login successful. Redirecting to /dashboard");
      req.session.user = { id: user._id, email: user.email, name: user.name };
  
      res.redirect('/dashboard');
    } catch (err) {
      res.render('login', { error: 'Email/password combination is wrong' });
    }
  };


const authenticated = (req, res, next)=> {
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next(); 
    }
    res.redirect('/login'); 
  };
  

module.exports={registerUser,loginUser,authenticated};