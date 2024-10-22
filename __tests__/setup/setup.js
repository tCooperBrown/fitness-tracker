import { app } from "../../server.js";
import request from "supertest";

export const testClient = request.agent(app);
