import type { Request, Response } from "express";
import { pool } from "../../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { IUser } from "./auth.interface";
import config from "../../confing/dotenv.config";

const createUserIntoDB = async (palyload: IUser) => {
  const { name, email, password, role } = palyload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
        INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
        `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const logingUserIntroDB = async (palyload: {
  email: string;
  password: string;
}) => {
  const { email, password } = palyload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invaild credentials");
  }
  //   console.log(userData.rows[0]);
  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invaild credentials");
  }

  const jwtPalyload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const token = jwt.sign(jwtPalyload, config.jwt_secret, { expiresIn: "1d" });

  delete user.password;
  console.log(token, user);
  return { token, user };
};

export const AuthService = {
  createUserIntoDB,
  logingUserIntroDB,
};
