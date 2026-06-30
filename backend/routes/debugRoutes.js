const express = require("express");
const {
    getRedisStatus,
    runRedisTest,
} = require("../controllers/debugController");

const router = express.Router();

router.get("/redis", getRedisStatus);
router.post("/redis-test", runRedisTest);

module.exports = router;
