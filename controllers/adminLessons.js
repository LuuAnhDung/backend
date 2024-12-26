const { faker } = require("@faker-js/faker");
const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");
const IsLessonDone = require("../models/IsLessonDone");

exports.getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json({
      message: "Fetch all lessons successfully!",
      lessons,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch lessons!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getLessonsBySectionId = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });
    res.status(200).json({
      message: "Fetch all lessons of section id successfully!",
      lessons: lessonsOfSection,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch lessons!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getLesson = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    const lesson = await Lesson.findById(lessonId);
    res.status(200).json({
      message: "Fetch single Lesson successfully!",
      lesson,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Lesson by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postLesson = async (req, res, next) => {
  const { sectionId, name, icon, description, type, content, access, password, videoLength } =
    req.body;

  console.log(req.files);

  // const images = req.files.map((item) => item.path.replace("\\", "/"));
  // const thumb = images.find((image) => image.includes("thumb"));

  try {
    const lesson = new Lesson({
      sectionId,
      name,
      icon,
      description,
      content,
      access,
      type,
      videoLength,
    });

    const response = await lesson.save();

    res.json({
      message: "Create Lesson successfully!",
      lesson: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post lesson!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  const { name, description, content, videoLength, access, type, password, oldImages } = req.body;
  const { lessonId } = req.params;

  // Kiểm tra xem file đã được gửi lên chưa
  const images = req.files ? req.files.map((item) => item.path.replace("\\", "/")) : [];
  const imageStrings = images.join(", ");
  const thumb = images.find((image) => image.includes("thumb"));
  const isDifferentImages = imageStrings !== oldImages;

  try {
    // Tìm bài học theo ID
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Cập nhật thông tin bài học
    lesson.name = name || lesson.name;
    lesson.description = description || lesson.description;
    lesson.content = content || lesson.content;
    lesson.videoLength = videoLength || lesson.videoLength;
    lesson.access = access || lesson.access;
    lesson.type = type || lesson.type;
    lesson.password = password || lesson.password;

    // Nếu có ảnh mới và khác với ảnh cũ
    if (isDifferentImages && images.length > 0) {
      lesson.images = imageStrings;  // Cập nhật ảnh mới
      lesson.thumbnail = thumb;  // Cập nhật thumbnail nếu có

      // Xóa các ảnh cũ không còn sử dụng
      if (oldImages) {
        oldImages.split(", ").forEach((image) => {
          deleteFile(image); // Hàm xóa ảnh từ ổ đĩa
        });
      }
    }

    // Lưu bài học đã cập nhật
    const updatedLesson = await lesson.save();

    res.json({
      message: "Update lesson successfully!",
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error("Error updating lesson: ", error);
    next(error);  // Chuyển lỗi cho middleware xử lý lỗi
  }
};

exports.deleteLesson = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    const { images } = await Lesson.findById(lessonId);
    const response = await Lesson.deleteOne({
      _id: lessonId,
    });

    res.json({
      message: "Delete Lesson successfully!",
      lessonId: lessonId,
      result: response,
    });

    // Loop and Delete Lesson images from images folder source
    images?.split(", ").forEach((image) => {
      deleteFile(image);
      console.log("deleted: ", image);
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to delete Lesson!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
