const asyncHandler = require("express-async-handler");
const Email = require("../utils/emailTemplate");
const ApiError = require("../utils/apiError");
const User = require("../schemas/userSchema");

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/user
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {
    _id: { $ne: req.user._id },
  };
  if (req.query.role && req.query.role !== "all") {
    filter.role = req.query.role;
  }

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [
      { email: searchRegex },
      { "profile.firstName": searchRegex },
      { "profile.lastName": searchRegex },
    ];
  }

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limit);

  // Real-time Stats Calculation
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const newUsersCount = await User.countDocuments({
    ...filter,
    createdAt: { $gte: startOfMonth },
  });

  const growth = totalUsers > 0 ? (newUsersCount / totalUsers) * 100 : 0;

  const instructorStats = {
    total: await User.countDocuments({ role: "instructor" }),
    active: await User.countDocuments({ role: "instructor", isActive: true }),
    verified: await User.countDocuments({
      role: "instructor",
      isVerified: true,
    }),
  };

  const adminStats = {
    total: await User.countDocuments({ role: "admin" }),
    active: await User.countDocuments({ role: "admin", isActive: true }),
  };

  res.status(200).json({
    status: "success",
    results: users.length,
    stats: {
      growth: growth.toFixed(1),
      instructors: instructorStats,
      admins: adminStats,
    },
    pagination: {
      currentPage: page,
      limit,
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data: users,
  });
});

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/v1/user/:id
 * @access  Private/Admin
 */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ApiError(`No user found with that ID: ${req.params.id}`, 404),
    );

  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc    Create user (Admin only)
 * @route   POST /api/v1/user
 * @access  Private/Admin
 */
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    email: req.body.email,
    password: req.body.password,
    profile: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
    },
    address: {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      zipCode: req.body.zipCode,
    },
    role: req.body.role,
    isVerified: true,
  });

  user.password = undefined;

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: user,
  });
});

/**
 * @desc    Update user (Admin only)
 * @route   Patch /api/v1/user/:id/profile
 * @access  Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(new ApiError(`No user found with ID: ${req.params.id}`, 404));

  const allowedFields = ["email", "role", "isVerified"];
  const profileFields = ["firstName", "lastName", "phone", "dateOfBirth"];
  const addressFields = ["street", "city", "state", "country", "zipCode"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  profileFields.forEach((field) => {
    if (req.body[field] !== undefined) user.profile[field] = req.body[field];
  });

  addressFields.forEach((field) => {
    if (req.body[field] !== undefined) user.address[field] = req.body[field];
  });

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: user,
  });
});

/**
 * @desc    Reset/Update user password (Admin only)
 * @route   PATCH /api/v1/user/:id/password
 * @access  Private/Admin
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(new ApiError(`No user found with ID: ${req.params.id}`, 404));

  user.password = req.body.password;
  user.passwordChangedAt = Date.now();
  await user.save();
  user.password = undefined;
  await Email.passwordChanged(user);

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
});

/**
 * @desc    Toggle user active/inactive status (Admin only)
 * @route   PATCH /api/v1/user/:id/toggle-status
 * @access  Private/Admin
 */
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(new ApiError(`No user found with ID: ${req.params.id}`, 404));
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  if (user.isActive) {
    await Email.accountActivated(user);
  } else {
    await Email.accountDeactivated(user);
  }

  res.status(200).json({
    status: "success",
    message: `User account has been ${
      user.isActive ? "activated" : "deactivated"
    } successfully.`,
    data: {
      id: user._id,
      isActive: user.isActive,
    },
  });
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/user/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(new ApiError(`No user found with ID: ${req.params.id}`, 404));

  await user.deleteOne();

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

/**
 * @desc    AI Chat (Admin only)
 * @route   POST /api/v1/ai-chat
 * @access  Private/Admin
 */
exports.aiChat = asyncHandler(async (req, res, next) => {
  const { message, confirmed = false } = req.body;
    console.log("from chat", {
    n8n: process.env.N8N_WEBHOOK_URL,
    secret: process.env.N8N_WEBHOOK_SECRET,
  });
  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${req.headers.authorization.split(" ")[0]} ${req.headers.authorization.split(" ")[1]}`,
      "x-n8n-secret": process.env.N8N_WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      message,
      confirmed,
      admin: {
        id: req.user?._id || req.user?.id,
        email: req.user?.email,
        role: req.user?.role,
      },
    }),
    signal: AbortSignal.timeout(60000),
  });

console.log(response)
  if (!response.ok) {
    return next(
      new ApiError(
        `n8n request failed: ${response.status} ${response.statusText}`,
        response.status,
      ),
    );
  }

  const data = await response.json();

  res.status(200).json({
    status: "success",
    message: data,
  });
});
