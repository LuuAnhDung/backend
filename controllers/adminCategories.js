const Category = require("../models/Category");
const Course = require("../models/Course");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
exports.getCategories = async (req, res, next) => {
  const { _q, _cateName } = req.query;

  console.log("query: ", _q);

  const query = {};

  if (_q) {
    query.$text = { $search: _q };
  }

  if (_cateName && _cateName !== "all") {
    query.name = _cateName;
  }

  try {
    const categories = await Category.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    });
    // console.log("categories: ", categories);

    const finalCategories = categories.map(async (cate) => {
      try {
        const courses = await Course.countDocuments({
          categoryId: cate._id,
        });

        console.log(courses);

        return {
          _id: cate._id,
          name: cate.name,
          cateImage: cate.cateImage,
          cateSlug: cate.cateSlug,
          description: cate.description,
          courses,
          createdAt: cate.createdAt,
          updatedAt: cate.updatedAt,
        };
      } catch (error) {
        if (!error) {
          const error = new Error("Failed to fetch categories!");
          error.statusCode(422);
          return error;
        }
        next(error);
      }
    });

    res.status(200).json({
      message: "Fetch categories sucessfully!",
      categories: await Promise.all(finalCategories),
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch categories!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      message: "Fetch all categories sucessfully!",
      categories,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch all categories!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const category = await Category.findById(categoryId);
    res.status(200).json({
      message: "fetch single category successfully!",
      category,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch categories!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};


exports.postCategory = async (req, res, next) => {
  const { name, cateImage , description } = req.body;

  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      console.log("errors: ", errors); 
      const validationError = new Error(errors.errors[0].msg);
      validationError.statusCode = 422;
      throw validationError;
    }

    //const imageUrl = req.file ? req.file.path.replace("\\", "/") : "images/user-avatar.jpg";
    const category = new Category({ name, cateImage, description });

    const response = await category.save();

    // Trả về thông tin category được tạo và mã trạng thái 201
    res.status(201).json({
      message: "Category created successfully!",
      category: response,
      // Thêm trường thông tin như ID hoặc các dữ liệu khác nếu cần thiết cho kiểm thử
    });

  } catch (error) {
    if (!error) {
      const error = new Error("Failed to create category!");
      error.statusCode = 422;
      return next(error);
    }
    next(error);
  }
};


// exports.updateCategories = async (req, res, next) => {
//   const { name, description, cateImage, cateSlug } = req.body;

//   const { categoryId } = req.params;

//   // Handling error when no upload images
//   // if (!req.file) {
//   //   const error = new Error("No image provided.");
//   //   error.statusCode = 422;
//   //   throw error;
//   // }
//   const errors = validationResult(req);

//   try {
//     if (!errors.isEmpty()) {
//       console.log("errors: ", errors);
//       // Get the first error
//       const validationError = new Error(errors.errors[0].msg);
//       validationError.statusCode = 422;
//       throw validationError;
//     }

//     const updatedCategory = await Category.findById(categoryId);
//     updatedCategory.name = name;
//     updatedCategory.description = description;
//     updatedCategory.cateSlug = cateSlug;
//     updatedCategory.cateImage = cateImage;
//     // If file is empty get the old one!
//     // if (req.file) {
//     //   console.log(req.file);
//     //   const cateImage = req.file.path.replace("\\", "/");
//     //   updatedCategory.cateImage = cateImage;

//     //   // Delete the old image
//     //   deleteFile(oldImage);
//     // }

//     const response = await updatedCategory.save();

//     res.status(200).json({
//       message: "Update category succesfully!",
//       category: response,
//     });
//   } catch (error) {
//     if (!error) {
//       const error = new Error("Failed to fetch categories!");
//       error.statusCode(422);
//       return error;
//     }
//     next(error);
//   }
// };

exports.updateCategories = async (req, res, next) => {
  const { name, description, cateSlug, cateImage } = req.body; 
  const { categoryId } = req.params;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationError = new Error(errors.errors[0].msg);
    validationError.statusCode = 422;
    return next(validationError);
  }

  try {
    // Tìm danh mục cần cập nhật
    const updatedCategory = await Category.findById(categoryId);
    if (!updatedCategory) {
      const error = new Error("Category not found!");
      error.statusCode = 404;
      return next(error);
    }

    // Cập nhật thông tin danh mục
    updatedCategory.name = name;
    updatedCategory.description = description;
    //updatedCategory.cateImage = cateImage;

    // Cập nhật cateImage nếu là URL
    if (cateImage) {
      // Kiểm tra nếu cateImage đã có trước đó và là một đường dẫn khác
      //if (updatedCategory.cateImage && updatedCategory.cateImage !== cateImage) {
        // Cập nhật với đường link mới
        updatedCategory.cateImage = cateImage;
      //}
    } else if (req.file) {
      // Nếu không có cateImage trong req.body nhưng có req.file, sử dụng file tải lên
      const newCateImage = `/uploads/images/${req.file.filename}`;
      
      // Xóa hình ảnh cũ nếu có
      if (updatedCategory.cateImage) {
        const oldImagePath = path.join(__dirname, "..", updatedCategory.cateImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updatedCategory.cateImage = newCateImage;
    }

    // Lưu danh mục đã cập nhật vào cơ sở dữ liệu
    const response = await updatedCategory.save();

    res.status(200).json({
      message: "Category updated successfully!",
      category: response,
    });
  } catch (error) {
    // Xử lý lỗi bất ngờ
    const unknownError = new Error("Failed to update category!");
    unknownError.statusCode = 500;
    return next(unknownError);
  }
};


// exports.updateCategories = async (req, res, next) => {
//   const { name, description, cateImage, cateSlug } = req.body;
//   const { categoryId } = req.params;

//   // Validate request body
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const validationError = new Error(errors.errors[0].msg);
//     validationError.statusCode = 422;
//     return next(validationError); // Return the validation error
//   }

//   try {
//     // Find the category to update
//     const updatedCategory = await Category.findById(categoryId);
//     if (!updatedCategory) {
//       const error = new Error("Category not found!");
//       error.statusCode = 404;
//       return next(error);
//     }

//     // Update category details
//     updatedCategory.name = name;
//     updatedCategory.description = description;
//     //updatedCategory.cateSlug = cateSlug;
//     //updatedCategory.cateImage = cateImage; // Keep the old or new image path

//     // If a new image is uploaded, handle the old one (optional)
//     if (req.file) {
//       const newCateImage = `/uploads/images/${req.file.filename}`;
//       updatedCategory.cateImage = newCateImage;

//       // Optionally delete the old image if required
//       if (updatedCategory.cateImage) {
//         const oldImagePath = path.join(__dirname, "..", updatedCategory.cateImage);
//         fs.unlink(oldImagePath, (err) => {
//           if (err) console.error("Error deleting old image:", err);
//         });
//       }
//     }

//     // Save the updated category to database
//     const response = await updatedCategory.save();

//     res.status(200).json({
//       message: "Category updated successfully!",
//       category: response,
//     });
//   } catch (error) {
//     // Handle unexpected errors
//     const unknownError = new Error("Failed to update category!");
//     unknownError.statusCode = 500;
//     return next(unknownError);
//   }
// };

exports.deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    // const { cateImage } = await Category.findById(categoryId);
    const response = await Category.deleteOne({
      _id: categoryId,
    });
    res.status(200).json({
      message: "Category deleted successfully!",
      categoryId: categoryId,
    });

    // delete file when delete cate row
    // deleteFile(cateImage);
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to delete category by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
