const {
  Order,
  validate,
  upsertSku,
  orderIdGenerator,
} = require("../models/order");

const router = require("express").Router();

router.get("/", async (req, res) => {
  const orders = await Order.find();
  res.send(orders);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let order = new Order({ ...req.body });
  order.sku = upsertSku(req.body);
  order.id = orderIdGenerator();
  order = await order.save();

  res.send(order);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const order = await Order.findOneAndUpdate(
    { id: req.params.id },
    { ...req.body },
    {
      new: true,
    }
  );

  if (!order)
    return res.status(404).send("The order with the given ID was not found.");

  res.send(order);
});

module.exports = router;
