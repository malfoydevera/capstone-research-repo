const express = require('express');
const router = express.Router();
// We don't need multer here anymore for the submit route, 
// because the file is already in the cloud!
const researchController = require('../controllers/research.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

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
  // REMOVED: upload.single('file') - We upload on frontend now
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

router.put(
  '/:id/resubmit',
  authenticate,
  // We don't need upload middleware here since frontend handles upload
  researchController.resubmitResearch
);

module.exports = router;