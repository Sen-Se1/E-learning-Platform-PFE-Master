const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

/**
 * @desc   Remote Authentication Middleware (calls userService)
 */
exports.protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token;

  if (authHeader?.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You are not logged in, please log in to access this route.", 401));
  }

  // Bypass for integration tests
  if (process.env.NODE_ENV === 'test' && token === 'test-token') {
    req.user = { _id: '65abc1234567890123456789', role: 'admin' };
    return next();
  }

  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8002/api/v1';
    const response = await fetch(`${userServiceUrl}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.warn(`Auth remote call rejected: ${response.status} - ${JSON.stringify(result)}`);
      return next(new ApiError(result.message || "Invalid or expired token", 401));
    }
    // Attach user to request
    req.user = result.data;
    next();
  } catch (err) {
    console.error("Auth remote call failed unexpectedly:", err.message, err.stack);
    return next(new ApiError("Authentication service connection failed", 503));
  }
});

/**
 * @desc   Authorization (User Permissions)
 */
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError("You are not authorized to access this route.", 403));
    }
    next();
  });
