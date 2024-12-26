const express = require("express");

const adminUserController = require("../controllers/adminUsers");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const router = express.Router();
const { check, body } = require("express-validator");



// GET USERS
router.get("/users", isAuth, isAdmin, adminUserController.getUsers);

// GET USER
router.get("/users/user/:userId", isAuth, adminUserController.getUser);

// CREATE RANDOM USER

router.get("/random-users", isAuth, isAdmin, adminUserController.createRandomUser);

// POST USER (What is the order when using middleware like this ? To combine validation )
router.post(
  "/users/user/create",
  isAuth,
  isAdmin,
  uploadMiddleware.single("avatar"),
  adminUserController.postUser
);

// PUT CATE
router.put(
  "/users/user/update/:userId",
  isAuth,
  isAdmin,
  uploadMiddleware.single("avatar"),
  adminUserController.updateUser
);

// DELETE CATE
router.delete("/users/user/delete/:userId", isAuth, isAdmin, adminUserController.deleteUser);

module.exports = router;
