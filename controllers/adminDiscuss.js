const Discuss = require("../models/Discuss");
const { validationResult } = require("express-validator");

exports.getAllDiscussCourse = async (req, res, next) => {
  try {
    const discusses = await Discuss.find();
    res.status(200).json({
      message: "Fetched all discussions successfully!",
      discusses,
    });
  } catch (error) {
    const err = new Error("Failed to fetch discussions!");
    err.statusCode = 500;
    next(err);
  }
};

exports.getDiscussById = async (req, res, next) => {
  const { discussId } = req.params;

  try {
    const discuss = await Discuss.findById(discussId);
    if (!discuss) {
      const err = new Error("Discussion not found!");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      message: "Fetched discussion successfully!",
      discuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDiscussByCourseId = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    const discusses = await Discuss.find({ courseId });
    res.status(200).json({
      message: "Fetched discussions by course ID successfully!",
      discusses,
    });
  } catch (error) {
    next(error);
  }
};

exports.getDiscussByLessonId = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    const discusses = await Discuss.find({ lessonId });
    res.status(200).json({
      message: "Fetched discussions by lesson ID successfully!",
      discusses,
    });
  } catch (error) {
    next(error);
  }
};

exports.addDiscussByCourseId = async (req, res, next) => {
  const { courseId, userId, comment } = req.body;

  try {
    const newDiscuss = new Discuss({
      courseId,
      userId,
      comment,
    });

    const savedDiscuss = await newDiscuss.save();

    res.status(201).json({
      message: "Created discussion successfully!",
      discuss: savedDiscuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDiscussByCourseId = async (req, res, next) => {
  const { discussId } = req.params;
  const { comment } = req.body;

  try {
    const updatedDiscuss = await Discuss.findByIdAndUpdate(
      discussId,
      { comment },
      { new: true }
    );

    if (!updatedDiscuss) {
      const err = new Error("Discussion not found!");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      message: "Updated discussion successfully!",
      discuss: updatedDiscuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDiscuss = async (req, res, next) => {
  const { discussId } = req.params;

  try {
    const deletedDiscuss = await Discuss.findByIdAndDelete(discussId);
    if (!deletedDiscuss) {
      const err = new Error("Discussion not found!");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      message: "Deleted discussion successfully!",
      discuss: deletedDiscuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateActiveDiscuss = async (req, res, next) => {
  const { discussId } = req.params;
  const { isActive } = req.body;

  try {
    const updatedDiscuss = await Discuss.findByIdAndUpdate(
      discussId,
      { isActive },
      { new: true }
    );

    if (!updatedDiscuss) {
      const err = new Error("Discussion not found!");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      message: "Updated active status successfully!",
      discuss: updatedDiscuss,
    });
  } catch (error) {
    next(error);
  }
};

exports.loadHistoriesForDiscuss = async (req, res, next) => {
  const { discussId } = req.params;

  try {
    const discuss = await Discuss.findById(discussId);
    if (!discuss) {
      const err = new Error("Discussion not found!");
      err.statusCode = 404;
      throw err;
    }

    // Assuming there is a `histories` field in the Discuss model
    res.status(200).json({
      message: "Fetched discussion histories successfully!",
      histories: discuss.histories || [],
    });
  } catch (error) {
    next(error);
  }
};
