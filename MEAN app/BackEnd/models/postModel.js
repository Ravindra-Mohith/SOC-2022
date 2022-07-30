const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mentors: {
    type: Number,
    required: true,
  },
  mentees: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  key: {
    type: Number,
    defaultValue: 0,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
