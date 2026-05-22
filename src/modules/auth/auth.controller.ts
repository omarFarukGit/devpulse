import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.createUserIntoDB(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.logingUserIntroDB(req.body);

    const { token } = result;

    res.cookie("token", token, {
      sameSite: "lax",
      httpOnly: true,
      secure: false,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const AuthController = {
  signup,
  login,
};
