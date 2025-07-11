import { Router } from "express";
import { getPetaData } from "../controllers/petaController";

const router = Router();

router.get("/", getPetaData);

export default router;
