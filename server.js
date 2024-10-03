const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./Middlewares/ErrorHandlerMiddleware/errorHandlerMiddleware");

const port = process.env.PORT || 8080;

//allowed all remote to acces backend
app.use(
  cors({
    origin: "*",
  })
);

//for handling json body data from front-end
app.use(express.json());
//for handling json body urlencoded data from front-end
app.use(express.urlencoded({ extended: false }));
connectDB();

app.get("/", (req, res) => {
  res.send({ msg: "server is working fine" });
});
//all the routes for serve
app.use("/api/user", require("./Routes/UserRoutes/userRoute"));
app.use("/api/prod", require("./Routes/ProductsRoute/productsRoute"));
app.use("/api/users", require("./Routes/CartRoute/cartRoute"));
app.use("/api/users", require("./Routes/OrderRoute/orderRoute"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`server running on port no ${port}`);
});
