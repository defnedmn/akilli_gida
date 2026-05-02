const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend çalışıyor");
});

app.listen(5000, () => {
  console.log("Server 5000 portunda çalışıyor");
});