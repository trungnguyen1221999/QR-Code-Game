import Shop from '../models/Shop.js';
import { validationResult } from 'express-validator';

// Get all shops
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('items');
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get shop by ID
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('items');
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get shops by checkpoint level
export const getShopsByCheckpointLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const shops = await Shop.find({ checkpointLevel: level }).populate('items');
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new shop
export const createShop = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, description, items, checkpointLevel } = req.body;

    const shop = new Shop({
      name,
      price,
      description,
      items: items || [],
      checkpointLevel
    });

    await shop.save();

    res.status(201).json({
      message: 'Shop created successfully',
      shop
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update shop
export const updateShop = async (req, res) => {
  try {
    const shopId = req.params.id;
    const updates = req.body;

    const shop = await Shop.findByIdAndUpdate(
      shopId,
      updates,
      { new: true, runValidators: true }
    ).populate('items');

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({
      message: 'Shop updated successfully',
      shop
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete shop
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to shop
export const addItemToShop = async (req, res) => {
  try {
    const { id: shopId, itemId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.items.includes(itemId)) {
      return res.status(400).json({ message: 'Item already in shop' });
    }

    shop.items.push(itemId);
    await shop.save();

    const updatedShop = await Shop.findById(shopId).populate('items');
    res.json({
      message: 'Item added to shop successfully',
      shop: updatedShop
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from shop
export const removeItemFromShop = async (req, res) => {
  try {
    const { id: shopId, itemId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    shop.items = shop.items.filter(item => item.toString() !== itemId);
    await shop.save();

    const updatedShop = await Shop.findById(shopId).populate('items');
    res.json({
      message: 'Item removed from shop successfully',
      shop: updatedShop
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};