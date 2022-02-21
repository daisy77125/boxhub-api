const Joi = require("joi");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const statuses = ["pending", "in-progress", "delivered"];
const conditions = ["wind-watertight", "new", "cargo-worthy"];
const conditions_code = ["WWT", "NEW", "CWO"];
const types = ["standard", "high-cube"];
const types_code = ["ST", "HC"];
const urlRegEx =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i;

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    created: {
      type: String,
      default: Date.now,
      set: (v) => dayjs(v).format("YYYY-MM-DD"),
      validate: (v) => dayjs(v, "YYYY-MM-DD", true).isValid(),
    },
    status: {
      type: String,
      enum: [...statuses],
      default: statuses[0],
    },
    customer: {
      type: String,
      required: true,
      minlength: 1,
    },
    sku: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
      match: urlRegEx,
    },
    condition: {
      type: String,
      required: true,
      enum: [...conditions],
    },
    size: {
      type: Number,
      required: true,
      get: (v) => `${v}ft`,
    },
    type: {
      type: String,
      required: true,
      enum: [...types],
    },
    origin_address: {
      type: String,
      required: true,
      minlength: 1,
    },
    shipping_address: {
      type: String,
      required: true,
      minlength: 1,
    },
  },
  {
    toJSON: {
      getters: true,
      setters: true,
    },
    toObject: {
      getters: true,
      setters: true,
    },
  }
);

const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
  const schema = Joi.object({
    created: Joi.date(),
    status: Joi.any().valid(...statuses),
    customer: Joi.string().min(1).required(),
    photo: Joi.string().regex(urlRegEx).required(),
    condition: Joi.any()
      .valid(...conditions)
      .required(),
    size: Joi.number().required(),
    type: Joi.any()
      .valid(...types)
      .required(),
    origin_address: Joi.string().min(1).required(),
    shipping_address: Joi.string().min(1).required(),
  });

  return schema.validate(order);
}

function orderIdGenerator() {
  const allCapsAlpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  const allNumbers = [..."0123456789"];

  let id = "";
  for (let i = 0; i < 3; i++) {
    id += allCapsAlpha[(Math.random() * allCapsAlpha.length) | 0];
  }
  for (let i = 0; i < 3; i++) {
    id += allNumbers[(Math.random() * allNumbers.length) | 0];
  }

  return id;
}

function upsertSku(order) {
  let typeCode = null;
  switch (order.type) {
    case types[0]:
      typeCode = types_code[0];
      break;
    case types[1]:
      typeCode = types_code[1];
      break;
    default:
      typeCode = "";
  }

  let conditionCode = null;
  switch (order.condition) {
    case conditions[0]:
      conditionCode = conditions_code[0];
      break;
    case conditions[1]:
      conditionCode = conditions_code[1];
      break;
    case conditions[2]:
      conditionCode = conditions_code[2];
      break;
    default:
      conditionCode = "";
  }
  return `JX-${order.size}-${typeCode}-${conditionCode}`;
}

exports.orderSchema = orderSchema;
exports.Order = Order;
exports.validate = validateOrder;
exports.upsertSku = upsertSku;
exports.orderIdGenerator = orderIdGenerator;
