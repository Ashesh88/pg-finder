const express = require('express');
const router = express.Router();
const { createListing, getAllListings, getListingById, updateListing, deleteListing } = require('../controllers/listingController');
const { protect, ownerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllListings);
router.get('/:id', getListingById);
router.post('/', protect, ownerOnly, createListing);
router.post('/upload', protect, ownerOnly, upload.array('images', 5), (req, res) => {
  const urls = req.files.map((f) => f.path);
  res.json({ urls });
});
router.put('/:id', protect, ownerOnly, updateListing);
router.delete('/:id', protect, ownerOnly, deleteListing);

module.exports = router;