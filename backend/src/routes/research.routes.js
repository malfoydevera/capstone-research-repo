const express = require('express');
const router = express.Router();
const multer = require('multer');
const researchController = require('../controllers/research.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Public routes
router.get('/published', researchController.getPublishedResearch);
router.get('/categories', researchController.getCategories);

// Protected routes - All authenticated users
router.get('/:id', authenticate, researchController.getResearchById);

// Student routes
router.post(
  '/submit',
  authenticate,
  authorize('student', 'staff', 'admin'),
  upload.single('file'),
  researchController.submitResearch
);

router.get(
  '/my/papers',
  authenticate,
  authorize('student', 'staff', 'admin'),
  researchController.getMyResearch
);

// Staff and Admin routes
router.get(
  '/all/papers',
  authenticate,
  authorize('staff', 'admin'),
  researchController.getAllResearch
);

router.post(
  '/:id/approve',
  authenticate,
  authorize('staff', 'admin'),
  researchController.approveResearch
);

router.post(
  '/:id/reject',
  authenticate,
  authorize('staff', 'admin'),
  researchController.rejectResearch
);

router.post(
  '/:id/revision',
  authenticate,
  authorize('staff', 'admin'),
  researchController.requestRevision
);

module.exports = router;