// import express from 'express';
// import jwt from 'jsonwebtoken';
// import User from '../models/Users.js';

// const router = express.Router();

// // Helper function to generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
//     expiresIn: '30d',
//   });
// };

// // @route   POST /api/auth/register
// // @desc    Register a new user
// // @access  Public
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password, phoneNumber, role, address } = req.body;

//     // 1. Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }

//     // 2. Create the user
//     const user = await User.create({
//       name,
//       email,
//       password,
//       phoneNumber,
//       role,
//       address,
//     });

//     // 3. Send response with JWT token
//     if (user) {
//       res.status(201).json({
//         success: true,
//         data: {
//           _id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           token: generateToken(user._id),
//         },
//       });
//     }
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });

// // @route   POST /api/auth/login
// // @desc    Authenticate user & get token
// // @access  Public
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Validate email & password presence
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'Please provide email and password' });
//     }

//     // 2. Find user in DB (explicitly select password because select: false is on the schema)
//     const user = await User.findOne({ email }).select('+password');

//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // 3. Check password using the matchPassword method from your user.js
//     const isMatch = await user.matchPassword(password);

//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // 4. Return user info with JWT token
//     res.status(200).json({
//       success: true,
//       data: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         token: generateToken(user._id),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// export default router;