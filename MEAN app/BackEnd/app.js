const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");

const Post = require("./models/postModel");

// app.use((req, res, next) => {
//   console.log("first middleware");
//   next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  //   res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  next();
});

app.post("/api/posts", (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    mentors: req.body.mentors,
    mentees: req.body.mentees,
    category: req.body.category,
    key: 0,
  });
  post.save();
  res.status(201).json({
    message: "post added successfully",
  });
});

app.put("/api/posts/:id", (req, res, next) => {
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    mentors: req.body.mentors,
    mentees: req.body.mentees,
    category: req.body.category,
  });
  Post.updateOne({ _id: post._id }, post).then((resu) => {});
  res.status(200).json({
    message: "updated project successfully!",
  });
});

app.get("/api/posts", (req, res) => {
  const p = Post.find();
  let fetchedPosts;
  if (req.query.pageSize && req.query.pageNo) {
    p.skip(+req.query.pageSize * (+req.query.pageNo - 1)).limit(
      req.query.pageSize
    );
  }
  p.then((docs) => {
    fetchedPosts = docs
    return Post.count();
  }).then((count)=>{
    res.status(200).json({
      status: "success",
      posts: fetchedPosts,
      maxPosts: count
    });
  })
});

app.delete("/api/posts/:id", (req, res) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {});
  res.status(200).json({
    message: "deleted",
  });
});

module.exports = app;
