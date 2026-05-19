const express = require('express');

const router = express.Router();

const {
    getCustomerOrder,
    createCustomerOrder,
    updateCustomerOrder,
    deleteCustomerOrder,
    getAllOrders,
    getOrdersByUserEmail
  } = require('../controllers/customer_orders');

  router.route('/')
  .get(getAllOrders)
  .post(createCustomerOrder);

  router.route('/user/:email')
  .get(getOrdersByUserEmail);

  router.route('/:id')
  .get(getCustomerOrder)
  .put(updateCustomerOrder) 
  .delete(deleteCustomerOrder); 


  module.exports = router;