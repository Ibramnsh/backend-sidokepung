import { Router } from "express";
import {
  getPekerjaanData,
  createPekerjaanData,
  updatePekerjaanData,
  deletePekerjaanData,
} from "../controllers/pekerjaanController";

const router = Router();

router.get("/", getPekerjaanData);
router.post("/", createPekerjaanData);
router.put("/:id", updatePekerjaanData);
router.delete("/:id", deletePekerjaanData);

export default router;
