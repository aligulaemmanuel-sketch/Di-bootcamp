"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const auth_1 = require("./routes/auth");
const users_1 = require("./routes/users");
const stories_1 = require("./routes/stories");
const comments_1 = require("./routes/comments");
const versions_1 = require("./routes/versions");
const upload_1 = require("./routes/upload");
const error_1 = require("./middleware/error");
const collab_1 = require("./ws/collab");
const io_1 = require("./ws/io");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: config_1.config.clientUrl.split(",") }));
app.use(express_1.default.json({ limit: "1mb" }));
app.use("/api/auth", auth_1.authRouter);
app.use("/api/users", users_1.usersRouter);
app.use("/api/stories", stories_1.storiesRouter);
app.use("/api/stories", comments_1.commentsRouter); // nested: /api/stories/:id/comments
app.use("/api/comments", comments_1.commentActionsRouter); // /api/comments/:id (+/reactions)
app.use("/api/versions", versions_1.versionActionsRouter); // /api/versions/:id/restore
app.use("/api/share", stories_1.shareRouter); // public share links
app.use("/api/upload", upload_1.uploadRouter);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use(error_1.notFound);
app.use(error_1.errorHandler);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: config_1.config.clientUrl.split(",") } });
(0, io_1.setIO)(io);
(0, collab_1.setupCollab)(io);
server.listen(config_1.config.port, () => {
    console.log(`StoryWeave API + realtime on http://localhost:${config_1.config.port}`);
});
