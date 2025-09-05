import request from "supertest";  
import app from "../src/index";


describe("API Health Check", () => {
  it("should return API is running", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
