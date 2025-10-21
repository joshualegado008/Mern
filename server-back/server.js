import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://malibogisreal63_db_user:joshualegado@cluster0.vjs3lom.mongodb.net/userdb?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Define Schema & Model with role field
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ===== ROUTES =====

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    console.log('📋 Fetching all users...');
    const users = await User.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${users.length} users`);
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    console.log('📝 Creating new user with data:', req.body);
    const { name, email, role } = req.body;
    
    if (!name || !email || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newUser = new User({ name, email, role });
    await newUser.save();
    console.log('✅ User created successfully:', newUser);
    res.status(201).json({ message: 'User added successfully!', user: newUser });
  } catch (err) {
    console.error('❌ Error adding user:', err);
    res.status(500).json({ message: 'Error adding user', error: err.message });
  }
});

// Update user by ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    console.log(`📝 Updating user ${id} with data:`, req.body);
    
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const user = await User.findByIdAndUpdate(
      id, 
      { name, email, role }, 
      { new: true, runValidators: true }
    );
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User updated successfully:', user);
    res.json({ message: 'User updated successfully!', user });
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'Error updating user', error: err.message });
  }
});

// Delete user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting user ${id}`);
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User deleted successfully');
    res.json({ message: 'User deleted successfully!', user });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'MERN User Manager API is running!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/users`);
});