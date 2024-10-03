const asyncHandler = require("express-async-handler");
const users = require("../../Models/UsersModel/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//user register
const register = asyncHandler(async (req, res) => {
  const { fname, lname, email, phone, password, address } = req.body;
  if (!fname || !lname || !email || !phone || !password || !address) {
    res.status(400);
    throw new Error("all field is required");
  }
  //cheking user available in database
  if ((await users.findOne({ email })) || (await users.findOne({ phone }))) {
    res.status(403);
    throw new Error("user already exist");
  }
  try {
    const hasedPassword = await bcrypt.hash(password, 10);
    const user = await users.create({
      fname,
      lname,
      email,
      phone,
      password: hasedPassword,
      address,
    });
    if (user) {
      const accesstoken = jwt.sign(
        { user: { email: user.email, id: user._id } },
        process.env.ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { user: { email: user.email, id: user._id } },
        process.env.REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        status: true,
        message: "User created successfully",
        data: {
          id: user.id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          phone: user.phone,
          ProfileImage: user.ProfileImage,

          address: user.address,

          accessToken: accesstoken,
          refreshToken: refreshToken,
        },
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error("something went wrong");
  }
});

//user login

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("all field is mandotory");
  }

  const available = await users.findOne({ email });
  if (!available) {
    res.status(404);
    throw new Error("user doesn't exist");
  }
  if (available && (await bcrypt.compare(password, available.password))) {
    const accessToken = jwt.sign(
      { user: { email: available.email, id: available._id } },
      process.env.ACCESS_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { user: { email: available.email, id: available._id } },
      process.env.REFRESH_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200);
    res.json({
      status: true,
      message: "User login successfull",
      data: {
        id: available.id,
        fname: available.fname,
        lname: available.lname,
        email: available.email,
        phone: available.phone,
        ProfileImage: available.ProfileImage,

        address: available.address,
        accessToken,
        refreshToken,
      },
    });
  } else {
    res.status(401);
    throw new Error("user is Unauthorized");
  }
});

// get profile details after authorization
const profile = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (id !== req.user._id.toString()) {
    res.status(401);
    throw new Error("token is invalid");
  }
  res.status(200).json({
    status: true,
    message: "sucessfully get profile ",
    data: req.user,
  });
});

//update profile details after authorization
const profileUpdate = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (id !== req.user._id.toString()) {
    res.status(401);
    throw new Error("token is invalid");
  }
  const { fname, lname, email, phone, password, address } = req.body;
  if (!fname || !lname || !email || !phone || !password || !address) {
    res.status(400);
    throw new Error("all field is required");
  }
  try {
    const hasedPassword = await bcrypt.hash(password, 10);
    const user = await users.findByIdAndUpdate(
      id,
      {
        fname,
        lname,
        email,
        phone,
        password: hasedPassword,
        address,
      },
      { new: true }
    );

    if (user) {
      res.status(201).json({
        status: true,
        message: "User profile updated",
        data: {
          id: user._id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          phone: user.phone,
          ProfileImage: user.ProfileImage,

          address: user.address,
        },
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error("something went wrong");
  }
});

//get access token after check valid refresh token
const refresh = asyncHandler(async (req, res) => {
  const { refresh_Token } = req.body;
  if (!refresh_Token) {
    res.status(400);
    throw new Error("refresh token is required");
  }

  try {
    var decode = jwt.decode(refresh_Token);
  } catch (error) {
    res.status(401);
    throw new Error("provide valid refresh token");
  }

  if (!decode) {
    throw new Error("provide valid refresh token");
  }

  const email = decode.user.email;
  if (!email) {
    res.status(404);
    throw new Error("provide valid refresh token");
  }
  const user = await users.findOne({ email });
  if (user) {
    const accesstoken = jwt.sign(
      { user: { email: user.email, id: user._id } },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { user: { email: user.email, id: user._id } },
      process.env.REFRESH_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      accessToken: accesstoken,
      refreshToken: refreshToken,
    });
  } else {
    res.status(401);
    throw new Error("inval_id refresh token");
  }
});

module.exports = {
  register,
  login,
  profile,
  profileUpdate,
  refresh,
};
