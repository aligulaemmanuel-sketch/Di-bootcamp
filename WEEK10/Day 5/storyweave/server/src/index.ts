import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { storiesRouter, shareRouter } from "./routes/stories";
import { commentsRouter, commentActionsRouter } from "./routes/comments";
import { versionsRouter, versionActionsRouter } from "./routes/versions";
import { uploadRouter } from "./routes/upload";
import { notFound, errorHandler } from "./middleware/error";
import { setupCollab } from "./ws/collab";
import { setIO } from "./ws/io";

const app = express();

app.use(cors({ origin: config.clientUrl.split(",") }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/stories", storiesRouter);
app.use("/api/stories", commentsRouter);        // nested: /api/stories/:id/comments
app.use("/api/comments", commentActionsRouter); // /api/comments/:id (+/reactions)
app.use("/api/versions", versionActionsRouter); // /api/versions/:id/restore
app.use("/api/share", shareRouter);             // public share links
app.use("/api/upload", uploadRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.clientUrl.split(",") } });
setIO(io);
setupCollab(io);

server.listen(config.port, () => {
  console.log(`StoryWeave API + realtime on http://localhost:${config.port}`);
});
