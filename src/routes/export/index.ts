import express from 'express';
import Admin from './Admin';
import Test from './Test';

const router = express.Router();

router.use('/admin', Admin);
router.use('/test', Test);

export default router;
