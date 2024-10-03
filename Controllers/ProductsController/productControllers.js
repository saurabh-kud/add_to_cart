const asyncHandler = require("express-async-handler");
const products = require("../../Models/ProductsModel/productsModel");

const setProducts = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    currencyId,
    currencyFormat,
    isFreeShipping,
    availableSizes,
  } = req.body;
  if (
    !title ||
    !description ||
    !price ||
    !currencyId ||
    !currencyFormat ||
    !isFreeShipping ||
    !availableSizes
  ) {
    res.status(400);
    throw new Error("all field is mandatory");
  }
  try {
    const titleOnDb = await products.findOne({ title });
    if (titleOnDb) {
      res.status(400);
      throw new Error("product already exist");
    }
    const product = await products.create({
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      availableSizes,
    });
    if (product) {
      res.status(201).json({
        status: true,
        message: "product added sucessfully",
        data: product,
      });
    } else {
      res.status(400);
      throw new Error("something went wrong");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const UpdateProduct = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  if (!_id) {
    res.status(400);
    throw new Error("id not found");
  }
  const {
    title,
    description,
    price,
    currencyId,
    currencyFormat,
    isFreeShipping,
    availableSizes,
  } = req.body;
  if (
    !title ||
    !description ||
    !price ||
    !currencyId ||
    !currencyFormat ||
    !isFreeShipping ||
    !availableSizes
  ) {
    res.status(400);
    throw new Error("all field is mandatory");
  }
  try {
    const updateProduct = await products.findByIdAndUpdate(
      _id,
      {
        title,
        description,
        price,
        currencyId,
        currencyFormat,
        isFreeShipping,
        availableSizes,
      },
      { new: true }
    );

    if (updateProduct) {
      res.status(201).json({
        status: true,
        message: "product updated sucessfully",
        data: updateProduct,
      });
    } else {
      res.status(400);
      throw new Error("something went wrong");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const getProducts = asyncHandler(async (req, res) => {
  //   const { price, ...query } = req.query;
  //   console.log(price, "  ----", query);

  try {
    // if (query || sort) {
    //   const productsss = await products.find({ title: "oneplus" });
    //   console.log(productsss);
    // }
    const productsss = await products.find();
    if (productsss) {
      res.status(200).json({
        status: true,
        message: "products  get sucessfully",
        data: productsss,
      });
    }
  } catch (error) {
    res.status(400);

    throw new Error(error.message);
  }
});
const getSingleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400);
    throw new Error("id not found");
  }
  try {
    const product = await products.findOne({ _id: id });
    if (product) {
      res.status(200).json({
        status: true,
        message: "product  get sucessfully",
        data: product,
      });
    } else {
      throw new Error("product not available");
    }
  } catch (error) {
    res.status(400);
    throw new Error("something went wrong");
  }
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { id: _id } = req.params;
  if (!_id) {
    res.status(400);
    throw new Error("id not found");
  }
  try {
    const deletedproduct = await products.findByIdAndDelete({ _id });
    if (deletedproduct) {
      res.status(200).json({
        status: true,
        message: "deleted sucessfully",
        data: deletedproduct,
      });
    } else {
      res.status(400);
      throw new Error("product not available");
    }
  } catch (error) {
    res.status(400);
    throw new Error("product not available");
  }
});
module.exports = {
  setProducts,
  UpdateProduct,
  getProducts,
  getSingleProduct,
  deleteProduct,
};
