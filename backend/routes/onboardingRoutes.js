import express from 'express';
import { saveOnboarding } from '../controllers/onboardingController.js';

const router = express.Router();

router.post('/save', saveOnboarding);

export default router;
