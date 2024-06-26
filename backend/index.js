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

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
  res.json({ message: 'Login successful', accessToken });
});

// Get User
app.get('/get-user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Retrieve user ID from req.user
    const isUser = await User.findById(userId); // Find user by ID

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            _id: isUser._id,
            createdOn: isUser.createdOn
        },
        message: "User info retrieved successfully",
    });
} catch (error) {
    console.error('Error fetching user:', error);
    return res.sendStatus(500);
}
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
  // res.json({ title, content, tags});
});
//edit-note
app.put('/edit-note/:noteId', authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user.userId;

  console.log('Note ID:', noteId);
  console.log('User ID:', userId);
  console.log('Request body:', req.body);

  if (!title && !content && !tags && typeof isPinned === 'undefined') {
      return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
      // Debug: Find the note without the userId filter first
      const noteWithoutUserId = await Note.findById(noteId);
      if (!noteWithoutUserId) {
          console.log('Note not found in database');
          return res.status(404).json({ error: true, message: "Note not found" });
      }

      // Debug: Check if the note's userId matches the userId from the token
      if (noteWithoutUserId.userId.toString() !== userId) {
          console.log('User ID mismatch');
          return res.status(403).json({ error: true, message: "Unauthorized" });
      }

      // Proceed with the update
      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
          console.log('Note not found or does not belong to user');
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
  const userId = req.user.userId; // Correctly destructure to get userId

  try {
    // Fetch notes belonging to the authenticated user and sort by isPinned
    const notes = await Note.find({ userId }).sort({ isPinned: -1 });

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
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  try {
    //const noteId = req.params.noteId;
    //const user = req.user;

    //console.log(`Attempting to delete note with ID: ${noteId} for user: ${userId}`);

    const note = await Note.findOne({ });
    if (!note) {
      console.error('Note not found');
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({});

    console.log('Note deleted successfully');

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting note:', error.message);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});


// update isPinned
app.put('/update-note-pinned/:noteId', authenticateToken, async (req, res) => {
  //const noteId = req.params.noteId;
  const { isPinned } = req.body;
  //const userId = req.user.userId;

  try {
    const note = await Note.findOne({});

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

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

//Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { userId } = req.user; // Correctly get the userId from req.user
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: true, message: "Search query is required" });
  }

  try {
    const matchingNotes = await Note.find({
      userId: userId,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    console.error('Error searching notes:', error.message); // Log the error for debugging
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

