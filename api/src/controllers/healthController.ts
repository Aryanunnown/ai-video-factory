import { Request, Response } from "express";
import { checkHealth } from "../services/healthService";

export const getHealth = (req: Request, res: Response) => {
  const result = checkHealth();
  res.status(200).json(result);
};
