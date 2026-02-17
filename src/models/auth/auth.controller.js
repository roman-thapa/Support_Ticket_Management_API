const authService = require('./auth.service');

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);

    return res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};
