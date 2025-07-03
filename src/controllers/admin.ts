import { Router } from "express";
import { handleAdmin } from "./handles";
import { loadConfig, loadRuntimeConfig } from "@/config";

export const adminController = Router();

adminController.get('/reload.action', async (req, res) => {
  if (!await handleAdmin(req, res)) return;

  const config = await loadConfig();
  loadRuntimeConfig(config);

  res.send('Reloaded');
});

