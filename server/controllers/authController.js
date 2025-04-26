import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

//Registration code

export const register= async(req,res)=>{
    const { name, email, password } = req.body || {};  
    console.log(req.body);
      if(!name || !email || !password){
        return res.json({
        success:false,message:'Missing Details'
        })
    }
    try{
       const existingUser= await userModel.findOne({email});
       if(existingUser){
        return res.json({success:false,message:"User already exists"});
       }
            const hashedPassword=await bcrypt.hash(password,10);
            const user=new userModel({name,email,password:hashedPassword})
      await user.save();

       const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
       res.cookie('token',token,{
        httpOnly:true,
        secure:process.env.Node_env==='production',
        sameSite:process.env.Node_env==='production'?'none':'strict',
        maxAge:7*24*60*60*1000
           });
       const mailOptions={
          from:process.env.SENDER_EMAIL,
          to:email,
          subject:"Welcome to our Website, ",
          text:"Thank You For registering in our Website"

        }
        await transporter.sendMail(mailOptions);
           res.json({success:true});
    }catch(error)
    {
        return res.json({success:false,message:error.message});
    }
}

//login code 
export const login= async(req,res)=>{
    const {email,password}=req.body;
    if( !email || !password){
        return res.json({
        success:false,message:'Email and Password are Required'
        })
    } 
  try{
      const user=await  userModel.findOne({email});
      if(!user){
return res.json({success:false,message:'invalid email'});
      }
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
        return res.json({success:false,message:'Invalid Password'});
      }
      const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
      res.cookie('token',token,{
       httpOnly:true,
       secure:process.env.Node_env==='production',
       sameSite:process.env.Node_env==='production'?'none':'strict',
       maxAge:7*24*60*60*1000
          });
          res.json({success:true});
  }
  catch(error){
    return res.json({success:false,message:error.message});
  }
}
  

//logout code 
export const logout=async(req,res)=>{
    try{
   res.clearCookie('token',{
    httpOnly:true,
       secure:process.env.Node_env==='production',
       sameSite:process.env.Node_env==='production'?'none':'strict',
   })
   return res.json({success:true,message:'logged out'});
    }catch(error)
    {
        return res.json({success:false,message:error.message});
    }
}


//otp Verification code 
/*export const sendVerifyOtp=async (req,res)=>{
  try{
      const {userId}=req.body
      const user=await userModel.findById(userId);

      if(user.isAccountVerified)
      {
        return res.json({success:false,message:"Account is already verified"});
      }
   const otp=String(Math.floor ( 10000 + Math.random()*900000))
   user.verifyOtp=otp;
   user.verifyOtpExpireAt=Date.now()+24*60*60*10000;
   await user.save();
   const mailOptions={
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:"account Verification Otp",
    text:`your otp is ${otp}.Verify your account using this otp`
    
   }
   await transporter.sendMail(mailOptions);
   res.json({success:true,message:"Verification otp sent on email"});
  }catch(error)
  {
    res.json({success:false,message:error.message});
  }
}*/
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Use from middleware, not body
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account is already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Verification OTP sent on email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/*
export const sendVerifyOtp = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id); // 👈 Use userId from token

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account is already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Verification OTP sent on email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
*/
/*export const verifyEmail= async(req,res)=>{
  const {userId,otp}=req.body;
  if(!userId || !otp)
  {
    res.json({success: false,message:"Missing details"});
  }
  try{
      const user=await userModel.findById(userId);
      if(!user){
        return res.json({success:false,message:'User not Found'});
      }
      if(user.verifyOtp==='' || user.verifyOtp!==otp){
        return res.json({success:false,message:'Invalid OTP'});
      }
      if(user.verifyOtpExpireAt<Date.now())
      {
        return res.json({success:false,message:'otp Expired'});
      }

      user.isAccountVerified=true;
      user.verifyOtp='';
      user.verifyOtpExpireAt=0;

      await user.save();
      return res.json({success:true,message:'Email verified Successfully'});

  }catch(error)
  {
    return res.json({success:false,message:error.message}); 
  }
}*/

export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId; // From userAuth middleware

    // Input validation
    if (!otp) {
      return res.status(400).json({ 
        success: false, 
        message: "OTP is required" 
      });
    }

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already verified
    if (user.isAccountVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account is already verified' 
      });
    }

    // OTP verification
    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    // Check OTP expiry
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Mark as verified and clear OTP fields
    user.isAccountVerified = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpireAt = undefined;
    
    await user.save();

    // Successful verification
    return res.json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Verify Email Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
export const isAuthenticated=async(req,res)=>{
  try{
      return res.json({success:true});
  }catch(error){
    res.json({success:false,message:error.message});
  }
}


//Password reset otp;
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const mailOptions = {
      from: `"Your App Name" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
        <br/>
        <p>If you didn't request this, please ignore the email.</p>
        <p>– Your App Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Reset OTP sent on email" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/*export const sendResetOtp= async(req,res)=>{
  const {email}=req.body;
  if(!email){
    res.json({success:false,message:"Email is required"});
  }
  try{
   const user= await userModel.findOne({email});
    if(!user){
      return res.json({success:false,message:"User not found"});
    }
    const otp=String(Math.floor ( 10000 + Math.random()*900000));
   user.verifyOtp=otp;
   user.verifyOtpExpireAt=Date.now()+15*60*10000;
   await user.save();
   const mailOptions={
    from:process.env.SENDER_EMAIL,
    to:user.email,
    subject:"Password Reset Otp",
    text:`your otp is ${otp}.Reset your account using this otp`
   }
   await transporter.sendMail(mailOptions);
   res.json({success:true,message:"Reset otp sent on email"});

  }catch(error){
    res.json({success:false,message:error.message});
  }
}
*/
//reset new password

export const resetPassword= async(req,res)=>{
  const {email,otp,newPassword}=req.body;

  if(!email || !otp || !newPassword){
    return res.json({success:false,message:"Missing details"});
  }
  try{
      const user=await userModel.findOne({email});
      if(!user){
        return res.json({success:false,message:"User not found"});
      }
      if(user.resetOtp==='' || user.resetOtp!==otp){
        return res.json({success:false,message:"Invalid Otp"});
      }
      if(user.resetOtpExpireAt<Date.now()){
        return res.json({success:false,message:"Otp expired"});
      }
   
      const hashedPassword=await bcrypt.hash(newPassword,10);

      user.password=hashedPassword;
      user.resetOtp='';
      user.resetOtpExpireAt=0;
      await user.save();
      return res.json({success:true,message:"Password reset successfully"});

  }catch(error)
  {
    return res.json({success:false,message:error.message});
  }

}

  