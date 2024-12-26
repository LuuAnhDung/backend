const { faker } = require("@faker-js/faker");
const Category = require("../models/Category");
const Section = require("../models/Section");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");

exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.find();
    res.status(200).json({
      message: "Fetch all Sections successfully!",
      sections,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Sections!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getSectionsByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const sectionsOfCourse = await Section.find({ courseId });

    res.status(200).json({
      message: "Fetch all Sections by course id successfully!",
      sections: sectionsOfCourse,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Sections by course id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getSection = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const section = await Section.findById(sectionId).populate("courseId");
    res.status(200).json({
      message: "Fetch single section successfully!",
      section,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Section by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

// exports.postSection = async (req, res, next) => {
//   const { courseId, name, access, description } = req.body;

//   // console.log(req.files);

//   // const images = req.files.map((item) => item.path.replace("\\", "/"));
//   // const thumb = images.find((image) => image.includes("thumb"));

//   try {
//     const section = new Section({
//       courseId,
//       name,
//       access,
//       description,
//     });

//     const response = await section.save();

//     res.json({
//       message: "Create Section successfully!",
//       Section: response,
//     });
//   } catch (error) {
//     if (!error) {
//       const error = new Error("Failed to post section!");
//       error.statusCode(422);
//       return error;
//     }
//     next(error);
//   }
// };
exports.postSection = async (req, res, next) => {
  const { courseId, name, access, description } = req.body;

  try {
    // Kiểm tra xem có tệp nào được tải lên không
    let images = [];
    if (req.files && Array.isArray(req.files)) {
      // Nếu có tệp, xử lý chúng
      images = req.files.map((item) => item.path.replace("\\", "/"));
      // Tìm thumbnail (nếu có)
      const thumb = images.find((image) => image.includes("thumb"));
      console.log("Uploaded images:", images);
      console.log("Thumbnail image:", thumb);
    }

    // Tạo mới Section
    const section = new Section({
      courseId,
      name,
      access,
      description,
    });

    // Lưu Section vào cơ sở dữ liệu
    const response = await section.save();

    res.json({
      message: "Create Section successfully!",
      Section: response,
    });
  } catch (error) {
    // Nếu có lỗi, trả về lỗi 422 với thông điệp
    const err = new Error("Failed to post section!");
    err.statusCode = 422;
    next(err);
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params; // Get sectionId from URL parameters
    const updatedData = req.body; // Get data to update from request body

    // Find the section by its ID and update it with the new data
    const updatedSection = await Section.findByIdAndUpdate(sectionId, updatedData, { new: true });

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    return res.status(200).json({ message: "Section updated successfully", updatedSection });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating section", error });
  }
};

exports.deleteSection = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const { images } = await course.findById(sectionId);
    const response = await course.deleteOne({
      _id: sectionId,
    });

    res.json({
      message: "Delete course successfully!",
      sectionId: sectionId,
      result: response,
    });

    // Loop and Delete course images from images folder source
    // images?.split(", ").forEach((image) => {
    //   deleteFile(image);
    //   console.log("deleted: ", image);
    // });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to delete course!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
