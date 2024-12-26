const express = require("express");
const adminDiscussController = require("../controllers/adminDiscuss");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

const router = express.Router();

// GET All Discussions (admin only)
router.get("/discuss", isAuth, isAdmin, adminDiscussController.getAllDiscussCourse);

// GET Discussion by ID (admin only)
router.get("/discuss/:discussId", isAuth, isAdmin, adminDiscussController.getDiscussById);

// GET Discussions by Lesson ID (admin only)
router.get("/discuss/lesson/:lessonId", isAuth, isAdmin, adminDiscussController.getDiscussByLessonId);

// GET Discussions by Course ID (admin only)
router.get("/discussions/course/:courseId", isAuth, isAdmin, adminDiscussController.getDiscussByCourseId);

// POST Add Discussion to Course (admin only)
router.post(
  "/discussions/course/:courseId",
  isAuth,
  isAdmin, // Only admin can add a discussion
  adminDiscussController.addDiscussByCourseId
);

// PUT Update Discussion (admin only)
router.put(
  "/discuss/update/:discussId",
  isAuth,
  isAdmin, // Only admin can update a discussion
  adminDiscussController.updateDiscussByCourseId
);

// DELETE Discussion (admin only)
router.delete(
  "/discuss/delete/:discussId",
  isAuth,
  isAdmin, // Only admin can delete a discussion
  adminDiscussController.deleteDiscuss
);

// PUT Update Active Status of Discussion (admin only)
router.put(
  "/discussions/active/:discussId",
  isAuth,
  isAdmin, // Only admin can update active status
  adminDiscussController.updateActiveDiscuss
);

// GET Discussion Histories (admin only)
router.get(
  "/discussions/histories/:discussId",
  isAuth,
  isAdmin, // Only admin can load discussion histories
  adminDiscussController.loadHistoriesForDiscuss
);

module.exports = router;
