const express = require("express");
const clientController = require("../controllers/client");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");


//GET author select
router.post("/users/authors/select", clientController.getAuthors);

//GET Categories Select
router.post("/categories/select", clientController.getCategories);


// GET Courses/
router.get("/courses", clientController.getCourses);

// GET Courses After Logined
router.get("/courses/logined", clientController.getCoursesAfterLogin);

// GET Popular courses

router.get("/courses/popular", clientController.getPopularCourses);

// POST Retrieve Cart

router.get("/carts/retrieve", clientController.retrieveCartByIds);

// GET Authors/
router.get("/users/authors", clientController.getAuthors);

// GET Course
router.get("/courses/course/:courseId", clientController.getCourse);

// GET Course enrolled
router.get("/courses/course/enrolled/:courseId", clientController.getCourseEnrolledByUserId);

// GET Course Detail
router.get("/courses/course/detail/:courseId", clientController.getCourseDetail);

// GET SECTIONS BY COURSE ID
router.get("/sections/course/:courseId", clientController.getSectionsByCourseId);

// GET SECTIONS BY COURSE ID
router.get("/lessons/section/:sectionId", clientController.getLessonsBySectionId);

// Get free lesson
 router.get("/lesson/course/free/:courseId", clientController.getFreeLessonsByCourseId)

// GET SECTIONS BY COURSE ID
router.get(
  "/lessons/section/course-enrolled/:sectionId",
  clientController.getLessonsBySectionIdEnrolledCourse
);

// POST reset password
router.post('/change-password', clientController.changePassword);


// GET CATES
router.get("/categories", clientController.getCategories);

// GET MAX PRICE
router.get("/course-max-price", clientController.getMaxPrice);

// GET MIN PRICE
router.get("/course-min-price", clientController.getMinPrice);

// GET CATES -- ID
router.get("/categories/category/:categoryId", clientController.getCategory);

// router.get('/status', clientController.getUserStatus)

router.patch("/courses/course/:courseId", clientController.updateViews);

// UPDATE CURRENT LESSON DONE BY USER ID
router.post("/lessons/lesson/done/:lessonId", clientController.updateLessonDoneByUser);

//
router.get("/lesson/is-done/:lessonId", clientController.checkLessonDoneUserId);

// POST ORDER create /orders/order/create
router.post("/order", clientController.postOrder);

// GET ORDER: id
router.get("/orders/order/:orderId", clientController.getOrder);

// GET COURSE BY STUDENTS HAVE BOUGHT
router.get("/courses/ordered/:userId", clientController.getCoursesOrderedByUser);

// Post increaseCourseView
router.post("/courses/course/increase-view/:courseId", clientController.increaseCourseView);

// GET USER: id

router.get("/users/user/:userId", clientController.getUser);

router.put("/users/user/update/:userId", clientController.updateUser);

// GET USER DETAIL
router.get("/users/user/detail/:userId", clientController.getUserDetail);

// CREATE REVIEW FOR COURSE ID OF USER ID AFTER ORDER

router.post("/courses/:courseId/reviews", clientController.postReview);

// GET COURES REVIEWS
router.get("/courses/reviews/:courseId", clientController.getCourseReviews);

// POST CREATE CERTIFICATIONS
router.post("/certificates/certificate/generate", clientController.postCertificate);

// GET CERTIFICATION BY USER AND COURSE ID
router.get("/certificates/certificate/get", clientController.getCertificate);

// DELETE CERTIFICATIONS BY USER AND COURSE ID
router.delete("/delete-certificates", clientController.deleteCertificate);

// GENREATE AI IMAGES
router.get("/genrate-ai-images", clientController.getAiImages);

// GENREATE AI IMAGES
router.get("/genrate-random-courses", clientController.generateRandomCourses);

// GENERATE UNSPLASH IMAGES

router.get("/get-unsplash-images", clientController.getImagesFromUnsplash);

// GENERATE SECTIONS OUTLINE
router.get("/generate-outline-course", clientController.generateOutlineCourse);

// CREATE OUTLINE COURSE AND SAVE AT DB
router.post("/create-outline-course", clientController.createOutlineCourse);

// GENERATE LESSONS BASE ON OUTLINE
router.get("/generate-lesson-of-outline", clientController.generateLessonOfOutline);

// CREATE LESSONS AND SAVE AT DB BASE ON OUTLINE
router.post("/create-lessons-of-outline-course", clientController.createLessonsOfOutlineCourse);

// GENERATE WHOLE COURSE
router.get("/generate-whole-course", clientController.generateTheWholeCourse);

// GENERATE WHOLE COURSE
router.post("/create-whole-course", clientController.createTheWholeCourse);


// Get all discusses of a course
router.get("/discuss/course/:courseId", clientController.getAllDiscussByCourse);

// Get all discusses of a user
router.get("/discuss/user/:userId", clientController.getAllDiscussByUser);

// Add a new discuss for a course
router.post("/discuss/add", clientController.addDiscussCourse);

// Delete a discuss
router.delete("/discuss/delete/:discussId", clientController.deleteDiscussCourse);

// Update a discuss
router.put("/discuss/update/:discussId", clientController.updateDiscussCourse);

// Add reply to a discuss

router.get("/discuss/discuss/:discussId", clientController.getDiscussById);

//Get all user by courseId

router.get("/courses/course/getUserByCourse/:courseId", clientController.getAllUsersByCourseId);

router.get("/carts/get-total-price", clientController.getTotalPrice);

router.get("/carts/get-total-price-without-user", clientController.getTotalPriceWithoutUser);

//Get all Note
router.get("/note/getAll", clientController.getAllNote);

//Get note by userid
router.get("/note/user/:userId", clientController.getNoteByUserId);

//Create note
router.post("/note/createNote/:lessonId", clientController.createNoteForLesson);

//Update note
router.put("/note/update/:noteId", clientController.updateNote);

//Delete note
router.delete("/note/delete/:noteId", clientController.deleteNote);

//Get note by id
router.get("/note/:noteId", clientController.getNoteById);

//Get notes by lesson ID
router.get("/note/lesson/:lessonId", clientController.getNotesByLessonId);

module.exports = router;
