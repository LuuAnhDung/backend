const Category = require("../models/Category");
const Course = require("../models/Course");
const IsLessonDone = require("../models/IsLessonDone");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Section = require("../models/Section");
const User = require("../models/User");
const axios = require("axios");
const Discuss = require("../models/Discuss");
const Note = require("../models/Note");
const mongoose = require("mongoose");

const {
  getProgressOfCourse,
  generateRandomAiImages,
  openai,
  generateRandomCourses,
  generateSectionsName,
  createOutline,
  getCourseDetailInfo,
  getCoursesOrderedByUserInfo,
  getLessonsByCourseId,
} = require("../utils/helper");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { UNSPLASH_API_KEY } = require("../config/constant");
const { searchYouTubeVideos } = require("../utils/youtube");
const Certificate = require("../models/Certificate");
// const Category = require('../models/category');
const bcrypt = require('bcryptjs');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    // console.log("categories: ", categories);
    res.status(200).json({
      message: "Fetch categories sucessfully!",
      categories,
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

exports.getCategoriesSelect = async (req, res, next) => {
  try {
    // Lấy tất cả các category, chỉ lấy trường name
    const categories = await Category.find().select("name");

    // Tạo mảng tên từ kết quả truy vấn
    const categoryNames = categories.map((category) => category.name);

    res.status(200).json({
      message: "Fetch all category names successfully!",
      categoryNames,
    });
  } catch (error) {
    console.error(error); // Log lỗi để debug
    next(new Error("Failed to fetch categories!"));
  }
};

exports.getAuthors = async (req, res, next) => {
  try {
    const courses = await Course.find().populate("userId", "_id name");

    const authors = courses.map((course) => course.userId);

    const authorList = [
      ...new Map(
        authors.map((author) => {
          return [author.name, { name: author.name, _id: author._id }];
        })
      ),
    ];

    res.status(200).json({
      mesasge: "Fetch authors sucessfully!",
      authors: authorList,
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


exports.getCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);

    res.status(200).json({
      message: "Fetch category by id successfully!",
      category,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch category by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};



exports.updateViews = async (req, res, next) => {
  const { CourseId } = req.params;

  try {
    const Course = await Course.findById(CourseId);

    Course.views += 1;

    const result = await Course.save();

    res.status(200).json({
      message: `view of Course: ${CourseId} increase to 1`,
      result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch category by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateLessonDoneByUser = async (req, res, next) => {
  const { lessonId } = req.params;

  const { userId } = req.body;

  try {
    const lessonDoneByUser = await IsLessonDone.findOne({
      lessonId: lessonId,
      userId: userId,
    });

    console.log(lessonDoneByUser);

    if (!lessonDoneByUser) {
      const lessonDone = new IsLessonDone({
        lessonId: lessonId,
        userId: userId,
        isDone: true,
      });

      const result = await lessonDone.save();

      res.status(200).json({
        message: `Update lesson done successfully!`,
        result,
      });
    } else {
      res.status(200).json({
        message: `Lesson aldready done by user`,
        result: "nothing",
      });
    }
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to Update lesson done!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

// const buildQuery = (req) => {
//   const { _q, _min, _max, _author, _level, _price, _topic } = req.query;
//   const query = {};

//   if (_q) {
//     query.$text = { $search: _q };
//   }

//   if (_level) {
//     console.log(_level);

//     query.level = {
//       $in: _level.split(","),
//     };
//   }

//   if (_price === "Free") {
//     query.finalPrice = 0;
//   } else if (_price === "Paid") {
//     query.finalPrice = { $gt: 0 };
//   }

//   if (_topic) {
//     query.categoryId = { $in: _topic.split(",") };
//   }

//   if (_author) {
//     query.userId = {
//       $in: _author.split(","),
//     };
//   }

//   if (_min !== undefined || _max !== undefined) {
//     query.$expr = { $and: [] };

//     if (_min !== undefined) {
//       query.$expr.$and.push({
//         $gte: [
//           { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
//           parseFloat(_min),
//         ],
//       });
//     }

//     if (_max !== undefined) {
//       query.$expr.$and.push({
//         $lte: [
//           { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
//           parseFloat(_max),
//         ],
//       });
//     }
//   }

//   return query;
// };

// exports.getCourses = async (req, res, next) => {
//   const { _limit, _sort, _q, _min, _max, _page, _cateIds, userId, _cateName } = req.query;

//   console.log("userId: ", userId);

//   const page = _page || 1;

//   console.log("sort: ", _sort);

//   const skip = (+page - 1) * _limit;

//   try {
//     const query = buildQuery(req);

//     const coursesQuery = Course.find(query, {
//       ...(query.$text && { score: { $meta: "textScore" } }),
//     })
//       .populate("categoryId", "_id name")
//       .populate("userId", "_id name avatar")
//       .skip(skip)
//       .limit(_limit || 12);

//     if (_sort) {
//       const sortQuery = {
//         ...(query.$text && { score: { $meta: "textScore" } }),
//       };

//       if (_sort === "newest") {
//         sortQuery.createdAt = -1;
//       }

//       coursesQuery.sort(sortQuery);

//       console.log(sortQuery);
//     }

//     const totalCourses = await Course.where(query).countDocuments();
//     // const totalCourses = await Course.countDocuments(query);
//     const courses = await coursesQuery;
//     const coursesOfUser = await getCoursesOrderedByUserInfo(userId);
//     const courseIdOfUserList = coursesOfUser.map((course) => course._id.toString());

//     let result = [];

//     for (const course of courses) {
//       const courseItem = {
//         ...course._doc,

//         isBought: courseIdOfUserList.includes(course._id.toString()) ? true : false,
//       };
//       result.push(courseItem);
//     }

//     res.status(200).json({
//       message: "Fetch all Courses successfully!",
//       courses: result,
//       pagination: {
//         _page: +_page || 1,
//         _limit: +_limit || 12,
//         _totalRows: totalCourses,
//       },
//     });
//   } catch (error) {
//     if (!error) {
//       const error = new Error("Failed to fetch Courses!");
//       error.statusCode = 422;
//       return error;
//     }
//     next(error);
//   }
// };
const buildQuery = (req) => {
  const { _q, _min, _max, _author, _level, _price, _topic } = req.query;
  const query = {};

  // Tìm kiếm theo từ khóa (text search)
  if (_q) {
    query.$text = { $search: _q };
  }

  // Lọc theo level nếu có
  if (_level) {
    query.level = { $in: _level.split(",") };
  }

  // Lọc theo giá (Free / Paid)
  if (_price === "Free") {
    query.finalPrice = 0;
  } else if (_price === "Paid") {
    query.finalPrice = { $gt: 0 }; // Các khóa học có giá lớn hơn 0
  }

  // Lọc theo category (topic)
  if (_topic) {
    query.categoryId = { $in: _topic.split(",") };
  }

  // Lọc theo author (userId)
  if (_author) {
    query.userId = { $in: _author.split(",") };
  }

  // Lọc theo giá trị min và max
  if (_min !== undefined || _max !== undefined) {
    query.$expr = { $and: [] };

    // Nếu có giá trị min, kiểm tra giá trị giảm giá (oldPrice - discount)
    if (_min !== undefined) {
      query.$expr.$and.push({
        $gte: [
          { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
          parseFloat(_min),
        ],
      });
    }

    // Nếu có giá trị max, kiểm tra giá trị giảm giá (oldPrice - discount)
    if (_max !== undefined) {
      query.$expr.$and.push({
        $lte: [
          { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
          parseFloat(_max),
        ],
      });
    }
  }

  return query;
};

exports.getCourses = async (req, res, next) => {
  const { _limit, _sort, _q, _min, _max, _page, _cateIds, userId, _cateName } = req.query;

  console.log("userId: ", userId);
  console.log("sort: ", _sort);

  const page = _page || 1;
  const skip = (+page - 1) * _limit;

  try {
    const query = buildQuery(req);

    // Tạo truy vấn cho courses với điều kiện lọc
    const coursesQuery = Course.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    })
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar")
      .skip(skip)
      .limit(_limit || 12);

    // Xử lý sắp xếp (nếu có)
    if (_sort) {
      const sortQuery = {
        ...(query.$text && { score: { $meta: "textScore" } }),
      };

      if (_sort === "newest") {
        sortQuery.createdAt = -1; // Sắp xếp theo ngày tạo
      }

      coursesQuery.sort(sortQuery);
      console.log("Sort query: ", sortQuery);
    }

    // Lấy tổng số khóa học thỏa mãn query
    const totalCourses = await Course.countDocuments(query);
    
    // Lấy danh sách khóa học từ cơ sở dữ liệu
    const courses = await coursesQuery;
    
    // Lấy danh sách khóa học của người dùng (nếu có userId)
    const coursesOfUser = await getCoursesOrderedByUserInfo(userId);
    const courseIdOfUserList = coursesOfUser.map(course => course._id.toString());

    // Tạo kết quả với trường `isBought` cho mỗi khóa học
    const result = courses.map(course => ({
      ...course._doc,
      isBought: courseIdOfUserList.includes(course._id.toString()),
    }));

    // Trả về kết quả
    res.status(200).json({
      message: "Fetch all Courses successfully!",
      courses: result,
      pagination: {
        _page: +_page || 1,
        _limit: +_limit || 12,
        _totalRows: totalCourses,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    next(error);
  }
};


exports.getCoursesAfterLogin = async (req, res, next) => {
  const { _limit, _sort, _q, _min, _max, _page, _cateIds, userId } = req.query;

  const page = _page || 1;

  console.log("sort: ", _sort);

  const skip = (+page - 1) * _limit;

  try {
    const query = buildQuery(req);

    const coursesQuery = Course.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    })
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar")
      .skip(skip)
      .limit(_limit || 12);

    if (_sort) {
      const sortQuery = {
        ...(query.$text && { score: { $meta: "textScore" } }),
      };

      if (_sort === "newest") {
        sortQuery.createdAt = -1;
      }

      coursesQuery.sort(sortQuery);

      console.log(sortQuery);
    }

    const totalCourses = await Course.where(query).countDocuments();
    // const totalCourses = await Course.countDocuments(query);
    const courses = await coursesQuery;

    // Get courses of users

    const coursesOfUser = await getCoursesOrderedByUserInfo(userId);

    const courseIdOfUserList = coursesOfUser.map((course) => course._id.toString());

    const result = [];

    for (const course of courses) {
      const courseItem = {
        ...course._doc,

        isBought: courseIdOfUserList.includes(course._id.toString()) ? true : false,
      };
      result.push(courseItem);
    }

    res.status(200).json({
      message: "Fetch all Courses successfully!",
      courses: result,
      pagination: {
        _page: +_page || 1,
        _limit: +_limit || 12,
        _totalRows: totalCourses,
      },
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode = 422;
      return error;
    }
    next(error);
  }
};

exports.getPopularCourses = async (req, res, next) => {
  const { _limit } = req.query;

  try {
    const coursePopularity = await Order.aggregate([
      { $unwind: "$items" }, // Unwind the items array --> What is unwind in this case
      { $group: { _id: "$items._id", count: { $sum: 1 } } }, // Group and count course occurrences, Why sum 1. Other params ?
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: +_limit || 10 }, // Limit the result to the top 10 courses, adjust as needed
    ]);

    const popularCourseIds = coursePopularity.map((entry) => entry._id);

    const totalCourses = (
      await Order.aggregate([
        { $unwind: "$items" }, // Unwind the items array --> What is unwind in this case
        { $group: { _id: "$items._id", count: { $sum: 1 } } }, // Group and count course occurrences, Why sum 1. Other params ?
      ])
    ).length;

    // Fetch course details using the popular IDs
    const popularCourses = await Course.find({ _id: { $in: popularCourseIds } })
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar");

    res.status(200).json({
      message: "Fetch all popular Courses successfully!",
      courses: popularCourses,
      pagination: {
        _page: 1,
        _limit: +_limit || 10,
        _totalRows: totalCourses,
      },
      coursePopularity,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch popular Courses!");
      error.statusCode = 422;
      return error;
    }
    next(error);
  }
};

// exports.getCoursesByCate = async (req, res, next) => {

//   try {
//     const query = {};

//     const courses = await Course.find(query).populate("categoryId", "_id name");

//     res.status(200).json({
//       message: "Fetch courses by category successfully!",
//       courses,
//     });
//   } catch (error) {
//     if (!error) {
//       const error = new Error("Failed to fetch courses by category!");
//       error.statusCode = 422;
//       return error;
//     }
//     next(error);
//   }
// };

exports.retrieveCartByIds = async (req, res, next) => {
  const { _courseIds } = req.query;

  console.log("courseId: ", _courseIds);

  if (!_courseIds) {
    res.status(200).json({
      message: "Cart is empty!",
      cart: {
        items: [],
        totalPrice: 0,
      },
    });

    return;
  }

  try {
    const courses = await Course.find({
      _id: { $in: _courseIds.split(",") },
    }).select("_id name finalPrice thumbnail userId level");

    const totalPrice = courses.reduce((acc, course) => acc + course.finalPrice, 0);

    const result = [];

    for (const course of courses) {
      const courseDetailInfo = await getCourseDetailInfo(course._id);

      const cartItem = {
        _id: courseDetailInfo._id,
        name: courseDetailInfo.name,
        thumbnail: courseDetailInfo.thumbnail,
        finalPrice: courseDetailInfo.finalPrice,
        level: courseDetailInfo.level,
        userId: courseDetailInfo.userId,
        numOfReviews: courseDetailInfo.numOfReviews,
        totalVideosLength: courseDetailInfo.totalVideosLength,
        avgRatingStars: courseDetailInfo.avgRatingStars,
        lessons: courseDetailInfo.lessons,
      };
      result.push(cartItem);
    }

    res.status(200).json({
      message: "Fetch  cart by course ids list successfully!",
      cart: {
        items: result,
        totalPrice: totalPrice,
      },
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to retrieve cart from database");
      error.statusCode = 422;
      return error;
    }
    next(error);
  }
};

exports.getSectionsByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const sectionsOfCourse = await Section.find({ courseId });

    const result = sectionsOfCourse.map(async (section) => {
      const lessons = await Lesson.find({ sectionId: section._id });
      const totalVideosLength = lessons.reduce((acc, lesson) => acc + lesson.videoLength, 0);
      return {
        ...section._doc,
        numOfLessons: lessons.length,
        totalVideosLength,
      };
    });

    console.log(result);

    res.status(200).json({
      message: "Fetch all Sections by course id successfully!",
      sections: await Promise.all(result),
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
exports.getSectionsByCourseIdEnrolledCourse = async (req, res, next) => {
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

exports.getLessonsBySectionId = async (req, res, next) => {
  const { sectionId } = req.params;
  const userId = req.get("userId");

  console.log(userId);
  console.log("sectionId: ", sectionId);

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });

    // const result = lessonsOfSection.map(async (lessonItem) => {
    //   const isDone = await IsLessonDone.findOne({
    //     userId: userId,
    //     lessonId: lessonItem._id,
    //   });

    //   return {
    //     _id: lessonItem._id,
    //     sectionId: lessonItem.sectionId,
    //     name: lessonItem.name,
    //     content: lessonItem.content,
    //     access: lessonItem.access,
    //     type: lessonItem.type,
    //     description: lessonItem.description,
    //     isDone: Boolean(isDone) ? true : false,
    //   };
    // });

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

exports.getLessonsBySectionIdEnrolledCourse = async (req, res, next) => {
  const { sectionId } = req.params;
  const userId = req.get("userId");

  console.log(userId);
  console.log("sectionId: ", sectionId);

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });

    const result = lessonsOfSection.map(async (lessonItem) => {
      const isDone = await IsLessonDone.findOne({
        userId: userId,
        lessonId: lessonItem._id,
      });

      return {
        _id: lessonItem._id,
        sectionId: lessonItem.sectionId,
        name: lessonItem.name,
        content: lessonItem.content,
        access: lessonItem.access,
        type: lessonItem.type,
        description: lessonItem.description,
        isDone: Boolean(isDone) ? true : false,
      };
    });

    res.status(200).json({
      message: "Fetch all lessons of section id successfully!",
      lessons: await Promise.all(result),
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

exports.getMaxPrice = async (req, res, next) => {
  try {
    const max = await Course.aggregate([
      {
        $project: {
          maxFieldValue: {
            $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }],
          },
        },
      },
      {
        $sort: {
          maxFieldValue: -1,
        },
      },
      { $limit: 1 },
    ]);

    res.status(200).json({
      message: "OK",
      result: max,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch price value!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getMinPrice = async (req, res, next) => {
  try {
    const min = await Course.aggregate([
      {
        $project: {
          minFieldValue: {
            $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }],
          },
        },
      },
      {
        $sort: {
          minFieldValue: 1,
        },
      },
      { $limit: 1 },
    ]);

    res.status(200).json({
      message: "OK",
      result: min,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch price value!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCoursesInRange = async (req, res, next) => {
  const { _min, _max } = req.query;

  try {
    const Courses = await Course.find({
      $expr: {
        $and: [
          {
            $gte: ["$oldPrice", _min],
          },
          {
            $lte: ["$oldPrice", _max],
          },
          {
            $gte: [
              { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
              _min,
            ],
          },

          {
            $gte: [
              { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
              _max,
            ],
          },
        ],
      },
    });

    res.status(200).json({
      message: "Oke",
      Courses,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses in range");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");

    res.status(200).json({
      message: "Fetch single Course successfully!",
      course,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourseEnrolledByUserId = async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.get("userId");

  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");

    const sectionsOfCourse = await Section.find({
      courseId,
    });

    let numOfLessonDone = 0;

    let lessonsOfCourse = [];

    for (const section of sectionsOfCourse) {
      const lessons = await Lesson.find({
        sectionId: section._id,
      });
      lessonsOfCourse.push(lessons);
    }

    lessonsOfCourse = lessonsOfCourse.flat();

    // console.log(lessonsOfCourse);
    const lessonIdsHasDone = [];
    for (const lesson of lessonsOfCourse) {
      const isDone = await IsLessonDone.findOne({
        userId,
        lessonId: lesson._id,
      });

      if (isDone) {
        numOfLessonDone += 1;
        lessonIdsHasDone.push(lesson._id);
      }
    }

    console.log("num of lesson Done: ", numOfLessonDone);

    const result = {
      ...course._doc,
      progress: numOfLessonDone / lessonsOfCourse.length,
      sections: sectionsOfCourse,
      lessons: lessonsOfCourse,
      lessonsDone: lessonIdsHasDone,
    };

    res.status(200).json({
      message: "Fetch single Course enrolled by user id successfully!",
      course: result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourseDetail = async (req, res, next) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  console.log("userId: ", userId);

  try {
    const result = await getCourseDetailInfo(courseId);
    let isBought = false;
    if (userId) {
      const orders = await Order.find({ "user._id": userId });

      const userCourses = orders.reduce((courses, order) => {
        return courses.concat(order.items);
      }, []);

      const userCourseIds = userCourses.map((course) => course._id.toString());

      isBought = userCourseIds.includes(courseId);
    }

    res.status(200).json({
      message: "Fetch single Course successfully with and without user id!",
      course: {
        ...result,
        isBought,
      },
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getUserDetail = async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);

  try {
    const user = await User.findById(userId);

    const courses = await Order.find({
      "user._id": userId,
    })
      .select("items")
      .populate("items._id");

    // .populate("categoryId", "_id name")
    // .populate("userId", "_id name");

    const coursesEnrolled = courses
      .map((courseItem) => {
        return courseItem.items;
      })
      .flat()
      .map((item) => item._id)
      .map(async (courseItem) => {
        const progress = (await getProgressOfCourse(courseItem._id, userId)).progress;
        const totalVideosLengthDone = (await getProgressOfCourse(courseItem._id, userId))
          .totalVideosLengthDone;
        const user = await User.findById(courseItem._doc.userId.toString());

        console.log("course item: ", courseItem._doc);

        return {
          ...courseItem._doc,
          // user id here is author of course
          userId: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          },
          progress: progress,
          totalVideosLengthDone,
        };
      });

    const result = {
      ...user._doc,
      courses: await Promise.all(coursesEnrolled),
    };

    res.status(200).json({
      message: "Fetch User Detail with fully data successfully!",
      user: result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCoursesOrderedByUser = async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);

  try {
    const courses = await getCoursesOrderedByUserInfo(userId);

    res.status(200).json({
      message: "Fetch Courses by user have ordered successfully!",
      courses: courses,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.checkLessonDoneUserId = async (req, res, next) => {
  const { lessonId } = req.params;
  const { userId } = req.body;

  try {
    const lessonFound = await IsLessonDone.findOne({
      lessonId: lessonId,
      userId: userId,
    });

    res.status(200).json({
      message: "Check lesson done successfully!",
      lesson: lessonFound,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to check Lesson Done!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  const { note, transaction, vatFee, items, user, totalPrice } = req.body;

  try {
    const courses = await Course.find({
      _id: {
        $in: items.map((item) => item.courseId),
      },
    });

    const order = new Order({
      note,
      vatFee,
      totalPrice,
      transaction: {
        method: transaction.method,
      },
      items: courses,
      user,
    });

    const response = await order.save();
    // Update qty Course at database (-qty);
    // Courses.items.forEach(async (Course) => {
    //   const { prodId, qty } = Course;
    //   console.log("update stock qty at database!!!");
    //   const CourseItem = await Course.findById(prodId);
    //   CourseItem.stockQty = CourseItem.stockQty - qty;
    //   CourseItem.save();
    // });

    // for (const Course of Courses.items) {
    //   const { prodId, qty } = Course;
    //   console.log("update stock qty at database!!!");
    //   const Course = await Course.findById(prodId);
    //   Course.stockQty = Course.stockQty - qty;
    //   Course.save();
    // }

    res.status(201).json({
      message: "Created order successfully!",
      order: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post order!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    res.status(200).json({
      message: "Get order by id successfully!",
      order,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to get order by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  // console.log("id: ", userId);

  try {
    const user = await User.findById(userId).select("_id name avatar email phone");

    const lessonDoneList = await IsLessonDone.find({
      userId: userId,
    });

    console.log(lessonDoneList);

    res.status(200).json({
      message: "fetch single user successfully!",
      user: user,
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

exports.postReview = async (req, res, next) => {
  const { courseId, title, content, ratingStar, orderId } = req.body;

  console.log("req.body: ", req.body);

  try {
    const newReview = new Review({
      courseId,
      title,
      content,
      ratingStar,
      orderId,
    });

    const result = await newReview.save();

    res.status(200).json({
      message: "Post review successfully!",
      review: result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post course review!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourseReviews = async (req, res, next) => {
  const { courseId } = req.params;

  console.log("course Id: ", courseId);

  try {
    const reviews = await Review.find({ courseId });

    res.status(200).json({
      message: "Fetch reviews successfully!",
      reviews,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post course review!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};


exports.getAllUsersByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params; // Lấy courseId từ params

    // Tìm tất cả các order có courseId trong items
    const orders = await Order.find({ "items._id": courseId });

    // Lấy danh sách người dùng từ các order
    const users = orders.map((order) => order.user);

    // Loại bỏ trùng lặp người dùng
    const uniqueUsers = Array.from(new Set(users.map((u) => JSON.stringify(u)))).map((u) => JSON.parse(u));

    // Nếu không tìm thấy người dùng nào
    if (!uniqueUsers || uniqueUsers.length === 0) {
      return res.status(404).json({
        message: "No users found for this course",
      });
    }

    // Lấy thêm thông tin avatar của từng user từ User model
    const userIds = uniqueUsers.map((user) => user._id);
    const detailedUsers = await User.find({ _id: { $in: userIds } }).select("_id name avatar email phone");

    // Trả về danh sách người dùng có thông tin chi tiết
    res.status(200).json({
      message: "Fetch users by course ID successfully!",
      users: detailedUsers,
    });
  } catch (error) {
    console.error("Error fetching users by course ID:", error);
    next(error || new Error("Failed to fetch users by course ID!"));
  }
};


// exports.updateUser = async (req, res, next) => {
//   const { userId } = req.params; // Lấy userId từ params
//   const updateData = req.body; // Lấy dữ liệu cập nhật từ body

//   try {
//     // Tìm và cập nhật người dùng theo ID
//     const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
//       new: true, // Trả về tài liệu đã cập nhật
//       runValidators: true, // Chạy các validator đã định nghĩa trong schema
//     });

//     // Nếu không tìm thấy người dùng
//     if (!updatedUser) {
//       return res.status(404).json({
//         message: "User not found!",
//       });
//     }

//     // Trả về kết quả
//     res.status(200).json({
//       message: "User updated successfully!",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error(error); // Log lỗi để debug
//     next(new Error("Failed to update user!"));
//   }
// };
exports.updateUser = async (req, res, next) => {
  const { userId } = req.params; // Lấy userId từ params
  const updateData = req.body; // Dữ liệu cập nhật từ body

  try {
    // Tìm người dùng và chỉ cập nhật những trường được truyền
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true, // Trả về tài liệu sau khi đã cập nhật
        runValidators: true, // Đảm bảo dữ liệu hợp lệ theo schema
      }
    );

    // Kiểm tra nếu không tìm thấy người dùng
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    // Trả về kết quả
    res.status(200).json({
      message: "User updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error); // Log lỗi để debug
    next(new Error("Failed to update user!"));
  }
};



// Retrieve to see history to track orders.
exports.getOrdersByIduser = async (req, res, next) => {};

// List all of orders at db
exports.getOrders = async (req, res, next) => {};

// GET all invoice
exports.getInvoices = async (req, res, next) => {};

// POST (GENREATE) CERTIFICATIONS

const generateCertificate = (userName, courseName, completionDate, res) => {

  const transformedCourseName = courseName.trim().split(" ").join("-");

  const certificateTemplatePath = path.join("images", "certificate-template.png");
  const certifcationName = `${userName}-${transformedCourseName}-certificate.pdf`;
  const outputCertification = path.join("images", certifcationName);
  const outputPath = `certificates/${userName}-certificate.pdf`;

  // Create a new PDF document
  const doc = new PDFDocument({ layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment", 'inline; filename="' + certifcationName + '"');

  // Pipe the PDF content to a writable stream (save it to a file)
  const writeStream = fs.createWriteStream(outputCertification);
  doc.pipe(writeStream);

  // Load the certificate template
  doc.image(certificateTemplatePath, 0, 0, { width: 792, height: 700 });

  // Function to center text horizontally
  const centerTextX = (text) => (doc.page.width - doc.widthOfString(text)) / 2;

  // doc.fontSize(36).fillColor("#333").text(userName, 100, 260, {
  //   align: "center",
  // });
  doc.font("Times-Italic")
   .fontSize(62)
   .fillColor("#333")
   .text(userName, 100, 270, {
     align: "center",
   });
  doc.moveDown(0.4);
  doc.fontSize(28).fillColor("#333").text(`Course: ${courseName}`, {
    align: "center",
  });
  doc.fontSize(18).fillColor("#555").text("This certificate is awarded to", {
    align: "center",
  });
  doc.fontSize(18).fillColor("#555").text(completionDate, {
    align: "center",
  });

  doc.end();

  return certifcationName;
};


exports.postCertificate = async (req, res, next) => {
  const { userId, courseId, completionDate } = req.body;

  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    const existingCertificate = await Certificate.findOne({
      "user._id": userId,
      "course._id": courseId,
    });

    console.log("certificate exist: ", existingCertificate);

    if (existingCertificate) {
      const error = new Error("Certificate ready exisit");

      // throw new Error(error.message);
      res.status(401).json({
        message: "Certificate already exists!",
      });
      return;
    }

    const certificateName = generateCertificate(user.name, course.name, completionDate, res);

    const newCertificate = new Certificate({
      certificateName: certificateName,
      user: {
        _id: userId,
      },
      course: {
        _id: courseId,
      },
    });

    const createdCertificate = await newCertificate.save();

    console.log("Create certificates successfully!");

    res.status(201).json({
      message: "Post certificate successfully!",
      certificate: createdCertificate,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to create certificates for user!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.deleteCertificate = async (req, res, next) => {
  const { userId, courseId } = req.query;

  try {
    const response = await Certificate.deleteMany({
      "user._id": userId,
      "course._id": courseId,
    });

    res.status(201).json({
      message: "get certification successfully!",
      result: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to create certifications for user!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCertificate = async (req, res, next) => {
  const { userId, courseId } = req.query;

  try {
    const certificate = await Certificate.findOne({
      "user._id": userId,
      "course._id": courseId,
    });
    res.status(201).json({
      message: "get certification successfully!",
      certificate,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to create certifications for user!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getAiImages = async (req, res, next) => {
  try {
    const response = await openai.createImage({
      prompt: "Nodejs advanced thumbnail course",
      n: 3,
      size: "256x256",
    });

    console.log(response.data);

    const image_url = response.data.data[0].url;

    console.log(image_url);

    res.status(200).json({
      image: image_url,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getImagesFromUnsplash = async (req, res, next) => {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: "Machine Learning",
        orientation: "landscape",
        client_id: UNSPLASH_API_KEY,
        per_page: 10,
      },
    });

    const randomIndex = Math.floor(Math.random() * response.data.results.length);

    res.status(200).json({
      message: "Fetch images from unsplash successfully!",
      response: response.data.results[randomIndex].urls.regular,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to get images from unsplash!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.generateRandomCourses = async (req, res, next) => {
  const randomCourses = await generateRandomCourses(10);

  try {
    for (const course of randomCourses) {
      const newCourse = new Course(course);
      await newCourse.save();
    }

    res.status(200).json({
      courses: randomCourses,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate random courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createOutlineCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const response = await createOutline(courseId);

    res.status(200).json({
      message: "Successfully to create outline course!",
      response,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.generateOutlineCourse = async (req, res, next) => {
  try {
    const outline = await generateSectionsName("64c5d873c573c1ec5d4a1907");

    res.status(200).json({
      message: "Successfully to generate outline course!",
      outline: outline,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate random courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.generateLessonOfOutline = async (req, res, next) => {
  try {
    const outline = await generateSectionsName("64c5d873c573c1ec5d4a18f5");

    const lessons = [];

    for (const sectionName of outline) {
      const currentLessons = await searchYouTubeVideos(sectionName);
      lessons.push(currentLessons);
    }

    res.status(200).json({
      message: "Successfully to generate lesson base on outline!",
      lessons,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate youtube videos and descriptions,... !");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createLessonsOfOutlineCourse = async (req, res, next) => {
  const { courseId } = req.body;
  try {
    const outline = await Section.find({ courseId });

    const lessons = [];

    for (const sectionItem of outline) {
      // Search youtube video base on query.
      const currentYoutubeVideos = await searchYouTubeVideos(sectionItem.name);

      const currSectionId = sectionItem._id;

      const newLessons = currentYoutubeVideos.map((video) => {
        return {
          sectionId: currSectionId,
          name: video.title,
          content: video.link,
          description: video.title,
          access: "PAID",
          type: "video",
          videoLength: video.videoLength,
        };
      });

      const createdLessons = await Lesson.insertMany(newLessons);
      lessons.push(createdLessons);
    }

    res.status(200).json({
      message: "Successfully to create lessons base on outline!",
      lessons: lessons.flat(),
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate youtube videos and descriptions,... !");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.generateTheWholeCourse = async (req, res, next) => {
  const courseId =""; //"64c5d873c573c1ec5d4a18f5";

  try {
    const outline = await generateSectionsName(courseId);

    // const sectionsCreatedcc = await Section.insertMany(outline);

    const lessons = [];

    for (const sectionName of outline) {
      // Search youtube video base on query.
      const currentYoutubeVideos = await searchYouTubeVideos(sectionName);

      // const currSectionId = sectionItem._id;

      const newLessons = currentYoutubeVideos.map((video) => {
        return {
          sectionId: "sdjfkldsjfklsdjfkldsjfkdsljf",
          name: video.title,
          content: video.link,
          description: video.title,
          access: "PAID",
          type: "video",
          videoLength: video.videoLength,
        };
      });

      // const createdLessons = await Lesson.insertMany(newLessons);
      lessons.push(newLessons);
    }

    const newCourse = {
      courseId,
      sections: outline,
      lessons: lessons.flat(),
    };

    res.status(200).json({
      message: "Successfully to generate the whole course with course id",
      courseCreated: newCourse,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate the whole course with course id");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createTheWholeCourse = async (req, res, next) => {
  const { courseId } = req.body;

  console.log(courseId);

  try {
    const sectionNameList = await generateSectionsName(courseId);
    const outline = sectionNameList.map((sectionName, index) => {
      return {
        courseId,
        name: `Section ${String(index + 1).padStart(2, "0")}: ${sectionName}`,
        access: "PAID", // Adjust the access type as needed
        description: sectionName, // Add a description for each section if required
      };
    });
    const sectionsCreated = await Section.insertMany(outline);

    const sectionsFound = await Section.find({ courseId });

    const lessons = [];

    for (const sectionItem of sectionsFound) {
      // Search youtube video base on query.
      const currentYoutubeVideos = await searchYouTubeVideos(sectionItem.name);

      const currSectionId = sectionItem._id;

      const newLessons = currentYoutubeVideos.map((video) => {
        return {
          sectionId: currSectionId,
          name: video.title,
          content: video.link,
          description: video.title,
          access: "PAID",
          type: "video",
          videoLength: video.videoLength,
        };
      });

      const createdLessons = await Lesson.insertMany(newLessons);
      lessons.push(createdLessons);
    }

    const newCourse = {
      courseId,
      sections: outline,
      lessons: lessons.flat(),
    };

    res.status(200).json({
      message: "Successfully to generate the whole course with course id",
      courseCreated: newCourse,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate the whole course with course id");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

////////////////////////////////

exports.getAllDiscussByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Tìm tất cả thảo luận của course và populate các trường liên quan
    const discuss = await Discuss.find({ courseId })
      .populate("userId", "name avatar") // Populate thông tin người dùng (userId)
      .populate({
        path: "replies", // Populate các phản hồi
        populate: { path: "userId", select: "name avatar" }, // Populate userId của phản hồi
      });

    if (!discuss) {
      const error = new Error("No discuss found for this course");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Fetch discussions successfully!",
      discuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllDiscussByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Tìm tất cả thảo luận của người dùng đã comment
    const discuss = await Discuss.find({ userId })
      .populate("userId", "name avatar") // Populate thông tin người dùng
      .populate({
        path: "replies", // Populate các phản hồi
        populate: { path: "userId", select: "name avatar" }, // Populate userId của phản hồi
      });

    if (!discuss) {
      const error = new Error("No discuss found for this user");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Fetch user discussions successfully!",
      discuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.addDiscussCourse = async (req, res, next) => {
  try {
    const { userId, courseId, comment } = req.body;

    // Tạo một thảo luận mới
    const newDiscuss = new Discuss({
      userId,
      courseId,
      comment,
    });

    const savedDiscuss = await newDiscuss.save();

    res.status(201).json({
      message: "Discuss added successfully!",
      discuss: savedDiscuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDiscussCourse = async (req, res, next) => {
  try {
    const { discussId } = req.params;

    const deletedDiscuss = await Discuss.findByIdAndDelete(discussId);

    if (!deletedDiscuss) {
      const error = new Error("Discuss not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Discuss deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDiscussCourse = async (req, res, next) => {
  try {
    const { discussId } = req.params;
    const { comment } = req.body;

    const updatedDiscuss = await Discuss.findByIdAndUpdate(
      discussId,
      { comment },
      { new: true }
    );

    if (!updatedDiscuss) {
      const error = new Error("Discuss not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Discuss updated successfully",
      discuss: updatedDiscuss,
    });
  } catch (error) {
    next(error);
  }
};


exports.getDiscussById = async (req, res, next) => {
  try {
    const { discussId } = req.params; // Lấy discussId từ URL params

    // Tìm discuss theo ID
    const discuss = await Discuss.findById(discussId);

    // Kiểm tra nếu discuss không tồn tại
    if (!discuss) {
      return res.status(404).json({
        message: 'Discussion not found',
      });
    }

    // Trả về discuss nếu tìm thấy
    res.status(200).json({
      message: 'Discussion retrieved successfully',
      discuss,
    });
  } catch (error) {
    // Bắt lỗi và chuyển đến middleware xử lý lỗi
    next(error);
  }
};


//exports.getAllUserByCourse = async (req, res, next) => {
  // try {
  //   const { courseId } = req.params;

  //   // Tìm tất cả người dùng đã tham gia khóa học, giả sử bạn có trường userId trong Discuss để xác định người tham gia khóa học.
  //   const users = await User.find({
  //     courses: courseId // Giả sử 'courses' là mảng các khóa học mà người dùng tham gia.
  //   });

  //   if (!users || users.length === 0) {
  //     const error = new Error("No users found for this course");
  //     error.statusCode = 404;
  //     throw error;
  //   }

  //   res.status(200).json({
  //     message: "Fetch users successfully!",
  //     users,
  //   });
  // } catch (error) {
  //   next(error);
  // }
//};

const calculateTotalPrice = async (courseIdArray) => {
  let totalPrice = 0;
  try {
    const courses = await Course.find({ _id: { $in: courseIdArray } }).select("finalPrice");

    courses.forEach((course) => {
      totalPrice += course.finalPrice;
    });

    return totalPrice;
  } catch (error) {
    throw new Error("Error calculating total price");
  }
};


exports.getTotalPrice = async (req, res, next) => {
  const { courseIds, couponCode } = req.query;
  const { userId } = req;

  try {
    let totalPrice = 0;
    let discountPrice = 0;
    let courseIdArray = [];

    if (typeof courseIds === "string" && courseIds.length > 0) {
      courseIdArray = courseIds.split(",");
    }

    if (courseIdArray.length > 0) {
      totalPrice = await calculateTotalPrice(courseIdArray);

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
          const error = new Error("Coupon not found");
          error.statusCode = 404;
          return next(error);
        }

        const usedByArray = coupon.usedBy.map((id) => id.toString());

        if (usedByArray.includes(userId)) {
          const error = new Error("Coupon already used by user");
          error.statusCode = 404;
          return next(error);
        }

        const currentDate = new Date();

        if (coupon.dateStart > currentDate || coupon.dateEnd < currentDate || coupon.isDeleted) {
          const error = new Error("Coupon is invalid");
          error.statusCode = 404;
          return next(error);
        }

        if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_PERCENT) {
          discountPrice = totalPrice * (coupon.discountAmount / 100);
        } else if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_FIXED_AMOUNT) {
          discountPrice = coupon.discountAmount;
        }

        totalPrice -= discountPrice;
      }
    }

    totalPrice = Math.max(totalPrice, 0);
    totalPrice = Number.isInteger(totalPrice) ? Math.floor(totalPrice) : parseFloat(totalPrice.toFixed(2));
    discountPrice = Number.isInteger(discountPrice) ? Math.floor(discountPrice) : parseFloat(discountPrice.toFixed(2));

    res.status(200).json({
      message: "Fetch total price successfully!",
      totalPrice,
      discountPrice,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 422;
    }
    next(error);
  }
};

exports.getTotalPriceWithoutUser = async (req, res, next) => {
  const { courseIds, couponCode } = req.query;

  try {
    let totalPrice = 0;
    let discountPrice = 0;
    let courseIdArray = [];

    if (typeof courseIds === "string" && courseIds.length > 0) {
      courseIdArray = courseIds.split(",");
    }

    if (courseIdArray.length > 0) {
      totalPrice = await calculateTotalPrice(courseIdArray);

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
          const error = new Error("Coupon not found");
          error.statusCode = 404;
          return next(error);
        }

        const currentDate = new Date();

        if (coupon.dateStart > currentDate || coupon.dateEnd < currentDate || coupon.isDeleted) {
          const error = new Error("Coupon is invalid");
          error.statusCode = 404;
          return next(error);
        }

        if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_PERCENT) {
          discountPrice = totalPrice * (coupon.discountAmount / 100);
        } else if (coupon.couponTypeId.toString() === COUPON_TYPES.COUPON_TYPE_FIXED_AMOUNT) {
          discountPrice = coupon.discountAmount;
        }

        totalPrice -= discountPrice;
      }
    }

    totalPrice = Math.max(totalPrice, 0);
    totalPrice = Number.isInteger(totalPrice) ? Math.floor(totalPrice) : parseFloat(totalPrice.toFixed(2));
    discountPrice = Number.isInteger(discountPrice) ? Math.floor(discountPrice) : parseFloat(discountPrice.toFixed(2));

    res.status(200).json({
      message: "Fetch total price successfully!",
      totalPrice,
      discountPrice,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 422;
    }
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // 1. Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // 2. Kiểm tra mật khẩu cũ có khớp không
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Old password is incorrect!' });
    }

    // 3. Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 4. Cập nhật mật khẩu mới
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: 'Password updated successfully!',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    next(new Error('Failed to update password!'));
  }
};

// Note
// exports.getAllNote = async (req, res, next) => {
//   try {
//     const notes = await Note.find();
//     res.status(200).json({ notes });
//   } catch (error) {
//     next(error || new Error("Failed to fetch notes!"));
//   }
// };
exports.getAllNote = async (req, res, next) => {
  try {
    const notes = await Note.find()
      .populate("userId", "name email") 
      .populate("lessonId", "name description") // Lấy thông tin `title` và `description` từ Lesson
      .populate("courseId", "name description") // Lấy thông tin `name` và `category` từ Course
      .exec();

    res.status(200).json({ notes });
  } catch (error) {
    console.error("Error fetching all notes:", error);
    next(error || new Error("Failed to fetch all notes!"));
  }
};

exports.getNoteByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Lấy danh sách note liên quan đến userId và populate thông tin user
    const notes = await Note.find({ userId })
      .populate("userId", "name avatar"); // Populate userId để lấy name và avatar

    // Nếu không tìm thấy ghi chú nào
    if (!notes || notes.length === 0) {
      return res.status(404).json({
        message: "No notes found for this user",
      });
    }

    // Trả về dữ liệu
    res.status(200).json({
      message: "Fetch user notes successfully!",
      notes,
    });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    next(error);
  }
};



// Get notes by user ID
exports.getNotesByUserId = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const notes = await Note.find({ userId });
    res.status(200).json({ notes });
  } catch (error) {
    next(error || new Error("Failed to fetch notes by user ID!"));
  }
};


// Create a new note
exports.createNoteForLesson = async (req, res, next) => {
  const { lessonId } = req.params;
  const { userId, content, videoMinute, courseId } = req.body;

  try {
    const newNote = new Note({
      courseId,
      userId,
      lessonId,
      content,
      videoMinute,
      createdBy: req.userId,
    });

    const savedNote = await newNote.save();

    res.status(201).json({
      message: "Note created successfully for the lesson!",
      note: savedNote,
    });
  } catch (error) {
    next(error || new Error("Failed to create note!"));
  }
};

// Update a note
exports.updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { content } = req.body;

  try {
    const existingNote = await Note.findById(noteId);
    if (!existingNote) {
      return res.status(404).json({ message: "No note found with this ID!" });
    }

    const note = await Note.findByIdAndUpdate(noteId, { content }, { new: true });

    if (!note) {
      return res.status(404).json({ message: "Failed to update the note!" });
    }

    note.updatedAt = new Date();
    
    res.status(200).json({
      message: "Note updated successfully!",
      note,
    });
  } catch (error) {
    next(error || new Error("Failed to update the note!"));
  }
};

// Delete a note
exports.deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// Get a note by ID

exports.getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params; // Lấy noteId từ URL params

    // Tìm note theo ID
    const note = await Note.findById(noteId);

    // Kiểm tra nếu note không tồn tại
    if (!note) {
      return res.status(404).json({
        message: 'Note not found',
      });
    }

    // Trả về note nếu tìm thấy
    res.status(200).json({
      message: 'Note retrieved successfully',
      note,
    });
  } catch (error) {
    // Bắt lỗi và chuyển đến middleware xử lý lỗi
    next(error);
  }
};


// Get notes by lesson ID
exports.getNotesByLessonId = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    const notes = await Note.find({ lessonId });
    res.status(200).json({ notes });
  } catch (error) {
    next(error || new Error("Failed to fetch notes by lesson ID!"));
  }
};


exports.getFreeLessonsByCourseId = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    // Tìm tất cả các section của course dựa trên courseId
    const sections = await Section.find({ courseId }).sort({ createdAt: 1 });
    if (!sections || sections.length === 0) {
      return res.status(404).json({
        message: "No sections found for this course.",
      });
    }

    // Lấy danh sách sectionId từ các section
    const sectionIds = sections.map((section) => section._id);
    console.log('Section IDs:', sectionIds);  // In ra để kiểm tra

    // Tìm tất cả các bài học miễn phí (access === 'FREE') không bị xóa trong các section
    const freeLessons = await Lesson.find({
      sectionId: { $in: sectionIds },
      access: "FREE",
      //isDeleted: false,
    });

    console.log('Free Lessons:', freeLessons);  // In ra để kiểm tra

    if (freeLessons.length === 0) {
      return res.status(404).json({
        message: "No free lessons found in the sections for this course.",
      });
    }

    // Trả về danh sách bài học miễn phí
    res.status(200).json({
      message: "Lessons fetched successfully",
      lessons: freeLessons,
    });
  } catch (error) {
    console.error("Error getting free lessons by course ID:", error);

    // Xử lý lỗi mặc định
    res.status(422).json({
      message: "An error occurred while fetching the lessons",
      error: error.message || 'Unknown error occurred',
    });
  }
};

exports.increaseCourseView = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    // Tìm khóa học theo ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Tăng lượt xem
    course.views = (course.views || 0) + 1;
    await course.save();

    // Trả về phản hồi thành công
    res.status(200).json({
      message: "View count increased successfully",
      views: course.views,
    });
  } catch (error) {
    next(error || new Error("Failed to increase course view!"));
  }
};
