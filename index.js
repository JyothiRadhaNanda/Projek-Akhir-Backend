import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

const fruits = ["banana", "apple", "melon", "durian"];

app.get("/fruits", (req, res) => {
  res.json({ data: fruits });
});
app.post("/fruits/add", (req, res) => {
  const newFruits = req.body.newFruits;
  newFruits.push();
  res.json({ message: `new fruit added!` });
});
// app.put();
// app.delete();

app.listen(3000, () => {
  console.log(`App listening on port: http://localhost:3000`);
});
