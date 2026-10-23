import CreditApplication from '../models/CreditApplication.js';
import { applicationRouter } from './applicationRouter.js';
export default applicationRouter(CreditApplication, 'business');
