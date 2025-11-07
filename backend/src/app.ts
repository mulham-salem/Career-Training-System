import express from "express";
import authRoute from "./routes/auth.route";
import profileRoute from "./routes/profile.route";
import cvRoute from "./routes/cv.route";
import jobRoute from "./routes/job.route";
import trainingRoute from "./routes/training.route";
import skillRoute from "./routes/skill.route";
import opportunityRoute from "./routes/opportunity.route";
import applicantRoute from "./routes/applicant.route";
import adminRoute from "./routes/admin.route";
import notificationRoute from "./routes/notification.route";
import aiRoute from "./routes/ai.route";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/cv", cvRoute);
app.use("/api/job", jobRoute);
app.use("/api/training", trainingRoute);
app.use("/api/skill", skillRoute);
app.use("/api/opportunity", opportunityRoute);
app.use("/api/applicant", applicantRoute);
app.use("/api/admin", adminRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/ai", aiRoute);

export default app;
