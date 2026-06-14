import { Router, type IRouter } from "express";
import healthRouter from "./health";
import portalDataRouter from "./portal-data";
import portalAuthRouter from "./portal-auth";
import portalRecordsRouter from "./portal-records";
import portalWorkOrdersRouter from "./portal-work-orders";
import portalIcsRouter from "./portal-ics";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(portalDataRouter);
router.use(portalAuthRouter);
router.use(portalRecordsRouter);
router.use(portalWorkOrdersRouter);
router.use(portalIcsRouter);
router.use(storageRouter);

export default router;
