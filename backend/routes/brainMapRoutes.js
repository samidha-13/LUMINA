import express from 'express';
import { getBrainMap, saveBrainMap } from '../controllers/brainMapController.js';

const router = express.Router();

router.get('/:userId', getBrainMap);
router.post('/save', saveBrainMap);

export default router;
