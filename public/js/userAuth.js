const User = require('./user');
const bcrypt = require('bcrypt');



const registerUser = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Registering user with email:", email, "and name:", name);
    if (!email) return res.render('login', { error: 'Email is empty' });
    if (!name) return res.render('login', { error: 'Name is empty' });
    if (!password) return res.render('login', { error: 'Password is empty' });
    await User.create({ email, name, password: hashedPassword });
    console.log("User created successfully");
    res.redirect('login');
  } catch (err) {
    console.error("Error during user registration:", err.message);
    res.status(500).send('Error registering user.');
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.render('login', { error: 'Email/password combination is wrong' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Email/password combination is wrong' });
    }

    console.log("Login successful. Redirecting to /dashboard");
    req.session.user = { id: user._id, email: user.email, name: user.name, user_type: user.user_type };

    if (user.user_type === "admin") {
      return res.redirect("/adminDashboard");
    }

    return res.redirect('/dashboard');
  } catch (err) {
    return res.render('login', { error: 'Email/password combination is wrong' });
  }
};


const authenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  res.redirect('login');
};

const adminOnly = (req, res, next) => {
  if (!req.session.user || req.session.user.user_type !== 'admin') {
    return res.status(403).send("Not Authorized");
  }
  next();
}


async function createAdminUser() {
  const existingAdmin = await User.findOne({
    $or: [{ username: "admin" }, { email: "admin@example.com" }]
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("adminpass", 10);
    await User.create({
      username: "admin",
      password: hashedPassword,
      email: "admin@example.com",
      user_type: "admin",
      name: "Admin User"
    });
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists.");
  }
}


const promoteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");

    if (user.user_type !== 'admin') {
      user.user_type = 'admin';
      await user.save();
      console.log(`User ${user.email} promoted to admin`);
    } else {
      console.log(`User ${user.email} is already an admin`);
    }

    return res.redirect("/adminDashboard");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

const demoteUser = async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).send("User not found");

    if (user.user_type !== 'user') {
      user.user_type = 'user';
      await user.save();
      console.log(`User ${user.email} demoted to user`);
    } else {
      console.log(`User ${user.email} is already a user`);
    }

    return res.redirect("/adminDashboard");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email user_type');
    res.render("adminDashboard", {
      activePage: "adminDashboard",
      users
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving users");
  }
}




module.exports = { registerUser, loginUser, authenticated, adminOnly, getAllUsers, createAdminUser, promoteUser, demoteUser };