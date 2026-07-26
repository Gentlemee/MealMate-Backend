import * as authService from "../services/auth.service.js";


// Register a new user
export const register = async (req, res) => {
    try{
        const result = await authService.registerUser(req.body);
        return res.status(201).json({
            success:true,
            message:"Registration successful.",
            data:result
        });
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
}; 


// Login a user
export const login = async (req,res)=>{
    try{
        const result = await authService.loginUser(req.body);
        return res.status(200).json({
            success:true,
            message:"Login successful.",
            data:result
        });
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
}; 

// Forgot Password
export const forgotPassword = async (req,res)=>{
    try{
        const result = await authService.forgotPassword(req.body);
        const response = {
            success:true,
            message:result.message
        };

        if (process.env.NODE_ENV !== "production") {
            response.data = {
                resetToken: result.resetToken,
                resetUrl: result.resetUrl,
                emailSent: result.emailSent,
            };
        }

        return res.status(200).json(response);
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
};

// Reset Password 
export const resetPassword = async (req,res)=>{
    try{
        const result = await authService.resetPassword(
            req.params.token,
            req.body.password
        );
        return res.status(200).json({
            success:true,
            message:result.message
        });
    }

    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
}; 

// Logout
export const logout = async (req,res)=>{
    try{
        await authService.logoutUser();
        return res.status(200).json({
            success:true,
            message:"Logged out successfully."
        });
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
}; 

// Get User Profile
export const getProfile = async (req,res)=>{
    try{
        const profile = await authService.getProfile(req.user.id);
        return res.status(200).json({
            success:true,
            data:profile
        });
    }

    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
};

// Update User Profile
export const updateProfile = async (req,res)=>{
    try{
        const user = await authService.updateProfile(
            req.user.id,
            req.body
        );
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully.",
            data:user
        });
    }

    catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
};
