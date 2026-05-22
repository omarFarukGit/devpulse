

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";

// src/modules/auth/auth.routes.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/confing/dotenv.config.ts
import dotenv from "dotenv";
dotenv.config({ quiet: true });
var config = {
  port: process.env.PORT,
  connectionString: process.env.NEON_URI,
  jwt_secret: process.env.JWT_SECRET
};
var dotenv_config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: dotenv_config_default.connectionString
});
var initDB = async () => {
  try {
    await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 
`);
    await pool.query(`
  CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  status VARCHAR(30) DEFAULT 'open',
  reporter_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    console.log("database connceted successfylly");
  } catch (error) {
    console.log("database not connected");
    console.log(error.message);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var createUserIntoDB = async (palyload) => {
  const { name, email, password, role } = palyload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
        `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var logingUserIntroDB = async (palyload) => {
  const { email, password } = palyload;
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invaild credentials");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invaild credentials");
  }
  const jwtPalyload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const token = jwt.sign(jwtPalyload, dotenv_config_default.jwt_secret, { expiresIn: "1d" });
  delete user.password;
  console.log(token, user);
  return { token, user };
};
var AuthService = {
  createUserIntoDB,
  logingUserIntroDB
};

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await AuthService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
var login = async (req, res) => {
  try {
    const result = await AuthService.logingUserIntroDB(req.body);
    const { token } = result;
    res.cookie("token", token, {
      sameSite: "lax",
      httpOnly: true,
      secure: false
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};
var AuthController = {
  signup,
  login
};

// src/modules/auth/auth.routes.ts
var router = Router();
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
var AuthRoute = router;

// src/modules/issues/issue.routes.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.controller.ts
import "express";

// src/modules/issues/issue.service.ts
import "process";
var createIssueIntroDB = async (payload, reporterId) => {
  const { title: title2, description, type } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id) VALUES ($1,$2,$3,$4) RETURNING *
        `,
    [title2, description, type, reporterId]
  );
  return result;
};
var getAllIssuesFromDB = async (query) => {
  const {
    sort = "newest",
    type,
    status
  } = query;
  let sqlQuery = ` SELECT * FROM issues`;
  const conditons = [];
  const values = [];
  if (type) {
    values.push(type);
    conditons.push(`type =$${values.length}`);
  }
  if (status) {
    values.push(status);
    conditons.push(`status =$${values.length}`);
  }
  if (conditons.length > 0) {
    sqlQuery += `WHERE ${conditons.join("AND")}`;
  }
  if (sort === "oldest") {
    sqlQuery += ` ORDER BY created_at ASC`;
  } else {
    sqlQuery += `ORDER BY created_at DESC`;
  }
  const issueResult = await pool.query(`
    SELECT * FROM issues  ORDER BY created_at DESC
    `);
  const issues = issueResult.rows;
  const updatedUssues = [];
  for (const issue of issues) {
    const reporterResult = await pool.query(
      `
      SELECT id,name,role FROM users WHERE id=$1
      `,
      [issue.reporter_id]
    );
    updatedUssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporterResult.rows[0],
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return updatedUssues;
};
var getSingleIssueFromDB = async (id) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const reporterResult = await pool.query(
    `
    SELECT id,name,role FROM users WHERE id=$1
    `,
    [issue.reporter_id]
  );
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0],
    create_at: issue.create_at,
    updated_at: issue.updated_at
  };
};
var updatedUssueFromDB = async (issueId, payload, user) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue Not Found");
  }
  if (user.role === "contributor") {
    if (issue.reporter_id !== user.id) {
      throw new Error("You cannot update other issue");
    }
    if (issue.status !== "open") {
      throw new Error("Open issues only editable");
    }
  }
  const result = await pool.query(
    `
    UPDATE issues SET title=$1,description=$2,type=$3,updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *
    `,
    [payload.title, payload.description, payload.type, issueId]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (issueId) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    `,
    [issueId]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  await pool.query(
    `
    DELETE FROM issues WHERE id=$1
    `,
    [issueId]
  );
};
var IssueService = {
  createIssueIntroDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updatedUssueFromDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const reporterId = req.user.id;
    console.log("re", reporterId);
    const result = await IssueService.createIssueIntroDB(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const result = await IssueService.getAllIssuesFromDB(req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const result = await IssueService.getSingleIssueFromDB(
      Number(req.params.id)
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const result = await IssueService.updatedUssueFromDB(
      issueId,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    await IssueService.deleteIssueFromDB(issueId);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
var IssuesController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized"
        });
      }
      const decoded = jwt2.verify(token, dotenv_config_default.jwt_secret);
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email=$1
        `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "user not found"
        });
      }
      req.user = decoded;
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access"
        });
      }
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invaild token"
      });
    }
  };
};

// src/modules/issues/issue.routes.ts
var router2 = Router2();
router2.post(
  "/",
  auth("contributor", "maintainer"),
  IssuesController.createIssue
);
router2.get("/", IssuesController.getAllIssues);
router2.get("/:id", IssuesController.getSingleIssue);
router2.patch(
  "/:id",
  auth("contributor", "maintainer"),
  IssuesController.updateIssue
);
router2.delete("/:id", auth("maintainer"), IssuesController.deleteIssue);
var IssuesRoute = router2;

// src/middleware/globalErrorHandler.ts
import "cors";
var globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "something went wrong";
  res.status(statusCode).json({
    success: false,
    message,
    errors: error
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("server running...!");
});
app.use("/api/auth", AuthRoute);
app.use("/api/issues", IssuesRoute);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(dotenv_config_default.port, () => {
    console.log(`Example app listening on port ${dotenv_config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map