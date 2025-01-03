const express = require("express");
const adminLessonController = require("../controllers/adminLessons");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");



// GET Lessons
router.get("/lessons", adminLessonController.getLessons);

// GET BY RANGES [MIN, MAX];

// router.get("/Lessons-by-price-range", adminLessonController.getLessonsInRange);
// router.get("/random-Lessons", adminLessonController.createRandomLessons);

// GET Lesson

router.get("/lessons/:lessonId", adminLessonController.getLesson);

// GET LESSON BY SECTION ID
router.get("/lessons/section/:sectionId", adminLessonController.getLessonsBySectionId);

// POST Lesson
router.post("/lessons/lesson/create", uploadMiddleware.array("images[]"), adminLessonController.postLesson);

// PUT Lesson
router.put(
  "/lessons/lesson/update/:lessonId",
  uploadMiddleware.array("images[]"),
  adminLessonController.updateLesson
);

// DELETE Lesson
router.delete("/lessons/lesson/update/:lessonId", adminLessonController.deleteLesson);

module.exports = router;
