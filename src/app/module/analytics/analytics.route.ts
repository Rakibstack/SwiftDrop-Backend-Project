import { Router } from "express";
import { analyticController } from "./analytics.controller";


const router = Router()


router.get('/admin-analytic',analyticController.getAdminAnalytics)



export const  analyticRouter = router