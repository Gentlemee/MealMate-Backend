const express = require('express');
const router = express.Router();
const Meal = require('../models/meal'); // Ensure this path matches your folder structure

// @route   GET /api/meals
// @desc    Get all available meals
router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find({ isAvailable: true });
    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/meals/:id
// @desc    Get single meal by ID
router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.status(200).json({ success: true, data: meal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @route   POST /api/meals
// @desc    Create a new meal
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    const newMeal = await Meal.create({
      name,
      description,
      price,
      category,
      imageUrl,
      isAvailable,
    });

    res.status(201).json({ success: true, data: newMeal });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create meal', error: error.message });
  }
});

// @route   PUT /api/meals/:id
// @desc    Update a meal
router.put('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.status(200).json({ success: true, data: meal });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update meal', error: error.message });
  }
});

// @route   DELETE /api/meals/:id
// @desc    Delete a meal
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.status(200).json({ success: true, message: 'Meal removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

module.exports = router;