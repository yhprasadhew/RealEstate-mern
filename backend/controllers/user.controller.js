import User from "../models/user.model.js";

// Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get public profile
export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name profilePic role createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update profile

export const updateProfile = async (req ,res) => {
    try{
        const {name,phone,address,removeProfilePic} = req.body ;
          const user = await User.findById(req.res)

          if (!user) {
            return res.status(404).json({
                success : false,
                message : "user not found"
            });

          }
    }
    catch(error){
        

    }
}