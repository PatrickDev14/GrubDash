const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// --- validation ---

// --- validate dish exists
function dishExists(req, res, next) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish not found: ${req.params.dishId}`,
  });
}

// --- validate name property
function nameIsValid(req, res, next) {
  // const name = res.locals.dish.name;
  const { data: { name } = {} } = req.body;
  if (name && name.length) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name."
  });
}

// --- validate description property
function descriptionIsValid(req, res, next) {
  // const description = res.locals.dish.description;
  const { data: { description } = {} } = req.body;
  if (description && description.length) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description."
  });
}

// --- validate price property
function dishHasPrice(req, res, next) {
  // const price = res.locals.dish.price;
  const { data: { price } = {} } = req.body;
  if (price) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a price."
  });
}

function priceIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0."
    }); 
  }
  return next();
}

// --- validate image_url property
function imageUrlIsValid(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url.length) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url."
 });
} 

// ----------

// GET: read a dish with :dishId
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// POST: create a new dish
function create(req, res) {
  const { data : { name, description, price, image_url} = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// GET: list all dishes
function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [
    nameIsValid,
    descriptionIsValid,
    dishHasPrice,
    priceIsValid,
    imageUrlIsValid,
    create
  ],
  read: [ dishExists, read],
  list,
}