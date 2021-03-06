const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// --- validation

// --- validate that order exists
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order ${orderId} not found.`
  });
}

// --- validate that request body 'id' matches :orderId
// --- the 'id' property is not required in the body of the request
function orderIdMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (orderId === id || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

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
  const index = dishes.findIndex(
    (dish) => (dish.quantity === "" || dish.quantity <= 0 || !Number.isInteger(dish.quantity))
  );
  if (index >= 0 ) {    // since findIndex returns -1 if an index is not found
    next({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0.`
    });
  }
  return next();
}

// --- validate the status property
function statusIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === "pending" || status === "preparing" || status === "out-for-delivery" || status === "delivered") {
    return next();
  }
  next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered."
 });
}

// --- validate if status is 'delivered' before a PUT method
function statusIsDelivered(req, res, next) {
  const { status } = res.locals.order;
  if (status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed.",
    });
  }
  return next();
}

// --- validate if status is 'pending' before a DELETE method
function statusIsPending(req, res, next) {
  const { status } = res.locals.order;
  if (status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending.",
  });
}

// --- handler functions

// POST: save an order and respond with the newly created order
// Note: Each dish in the Order's dishes property is a complete copy of the dish, rather than a reference to the dish by ID. 
// This is so the order does not change retroactively if the dish data is updated some time after the order is created.
function create(req, res) {
  const { data : { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// GET: the existing order where id === :orderId
function read(req, res) {
  res.json({ data: res.locals.order });
}

// PUT: update an order
function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  res.json({ data: order });
}

// DELETE: delete an existing order, which has a status of pending
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  orders.splice(index, 1);
  res.sendStatus(204);
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
  read: [ orderExists, read ],
  update: [
    orderExists,
    orderIdMatches,
    deliverToIsValid,
    mobileNumberIsValid,
    orderHasDishes,
    dishesIsValid,
    quantityIsValid,
    statusIsValid,
    statusIsDelivered,
    update,
  ],
  delete: [
    orderExists,
    statusIsPending,
    destroy,
  ],
  list,
}