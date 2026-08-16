const express = require('express');
const {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');

const {
  createModuleValidator,
  getModuleValidator,
  updateModuleValidator,
  deleteModuleValidator,
} = require('../utils/validators/moduleValidator');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getModules)
  .post(createModuleValidator, createModule);

router.route('/:id')
  .get(getModuleValidator, getModule)
  .put(updateModuleValidator, updateModule)
  .delete(deleteModuleValidator, deleteModule);

module.exports = router;
