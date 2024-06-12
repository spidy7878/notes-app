/*
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');

const config = require('./config.json');
const User = require('./models/user.model');
const Note = require('./models/note.model');

mongoose.connect(config.connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.json({ data: 'hello' });
});

app.post('/create-account', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) return res.status(400).json({ error: true, message: 'Full Name is required' });
  if (!email) return res.status(400).json({ error: true, message: 'Email is required' });
  if (!password) return res.status(400).json({ error: true, message: 'Password is required' });

  const isUser = await User.findOne({ email });
  if (isUser) return res.status(409).json({ error: true, message: 'User already exists' });

  const user = new User({ fullName, email, password });
  await user.save();

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.json({ error: false, user, accessToken, message: 'Registration successful' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });

  const user = await User.findOne({ email });
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid email or password' });

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', accessToken });
});

app.post('/add-note', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const userId = req.user.userId;

  if (!title) return res.status(400).json({ error: true, message: 'Title is required' });
  if (!content) return res.status(400).json({ error: true, message: 'Content is required' });

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId
    });

    await note.save();

    res.json({ error: false, note, message: 'Note added successfully' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
});

app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags && typeof isPinned === 'undefined') {
    return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error('Error editing note:', error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});


app.listen(8000);
module.exports = app;
*/

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./utilities');

const config = require('./config.json');
const User = require('./models/user.model');
const Note = require('./models/note.model');

mongoose.connect(config.connectionString, {
  //useNewUrlParser: true,
  //useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.json({ data: 'hello' });
});

// account
app.post('/create-account', async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) return res.status(400).json({ error: true, message: 'Full Name is required' });
  if (!email) return res.status(400).json({ error: true, message: 'Email is required' });
  if (!password) return res.status(400).json({ error: true, message: 'Password is required' });

  const isUser = await User.findOne({ email });
  if (isUser) return res.status(409).json({ error: true, message: 'User already exists' });

  const user = new User({ fullName, email, password });
  await user.save();

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.json({ error: false, user, accessToken, message: 'Registration successful' });
});
// login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });

  const user = await User.findOne({ email });
  if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid email or password' });

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '36000m' });
  res.json({ message: 'Login successful', accessToken });
});
//Add Note
app.post('/add-note', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const userId = req.user.userId;

  if (!title) return res.status(400).json({ error: true, message: 'Title is required' });
  if (!content) return res.status(400).json({ error: true, message: 'Content is required' });

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId
    });

    await note.save();

    res.json({ error: false, note, message: 'Note added successfully' });
  } catch (error) {
    console.error('Error adding note:', error.message);
    res.status(500).json({ error: true, message: 'Internal Server Error' });
  }
});
//edit-note
app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user.userId;

  if (!title && !content && !tags && typeof isPinned === 'undefined') {
    return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (typeof isPinned !== 'undefined') note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error('Error editing note:', error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});
// get all notes
app.get('/get-all-notes', authenticateToken, async (req, res) => {
  // const userId = req.users; // Destructure correctly to get userId
  // console.log('Fetching notes for user:', userId); // Log the userId
  // console.log("Request Object", req);

  try {
    // const notes = await Note.find({ userId }).sort({ isPinned: -1 });
    const notes = await Note.find({});

    console.log('Notes found:', notes); // Log the notes found

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    console.error('Error retrieving notes:', error.message);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});
// delete note
app.delete("/delete-note/:noteId", authenticateToken, async(req,res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try{
    const note = await Note.findOne({_id:noteId, userId: user._id});
    if(!note){
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId,userId: user._id });

    return res.json({
      error:false,
      message:"Note deleted successfully",
    });
  } catch (error){
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
})
// update isPinned
app.put('/update-note-pinned/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (typeof isPinned !== 'undefined') note.isPinned = isPinned || false;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error('Error editing note:', error.message);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});




app.listen(8000, () => {
  console.log('Server is running on port 8000');
});

module.exports = app;

