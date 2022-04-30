const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// --- validation ---

// --- validate dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

// --- validate request body 'id' matches :dishId
// --- the 'id' property is not required in the body of the request
function dishIdMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (dishId === id || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

// --- validate name property
function nameIsValid(req, res, next) {
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
  const { data: { price } = {} } = req.body;
  if (price) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a price."
  });
}

// --- validate that price property is valid
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

// --- handler functions

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

// GET: read a dish where id === :dishId
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// PUT: update an existing dish with :dishId
function update(req, res, next) {
  const dish = res.locals.dish;
  const { data : { name, description, price, image_url} = {} } = req.body;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.json({ data: dish });
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
  update: [
    dishExists,
    dishIdMatches,
    nameIsValid,
    descriptionIsValid,
    dishHasPrice,
    priceIsValid,
    imageUrlIsValid,
    update,
  ],
  list,
}