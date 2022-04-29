const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// --- validation

// --- validate deliverTo property
function deliverToIsValid(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo.length) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo."
  });
}

// --- validate mobileNumber property
function mobileNumberIsValid(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber.length) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber."
  });
}

// --- validate dishes property
function orderHasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a dish."
  });
}

// --- validate that dishes property is an array, and is not empty
function dishesIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length > 0) {
    return next(); 
  }
  next({
    status: 400,
    message: "Order must include at least one dish."
  });
}

// --- validate quantity property
function quantityIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const hasInvalidQuantity = dishes.find(
    (dish) => dish.quantity === "" || dish.quantity <= 0 || !Number.isInteger(dish.quantity)
  );
  if (hasInvalidQuantity) {
    const index = dishes.indexOf(hasInvalidQuantity);
    console.log(index);
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0.`
    });
  }
  return next();
}

// ---

// POST: save an order and respond with the newly created order
// Note: Each dish in the Order's dishes property is a complete copy of the dish, rather than a reference to the dish by ID. 
// This is so the order does not change retroactively if the dish data is updated some time after the order is created.
function create(req, res) {
  const { data : { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// GET: list all existing order data
function list(req, res) {
  res.json({ data: orders });
}

module.exports = {
  create: [
    deliverToIsValid,
    mobileNumberIsValid,
    orderHasDishes,
    dishesIsValid,
    quantityIsValid,
    create,
  ],
  list,
}