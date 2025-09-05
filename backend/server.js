const app = require("./src/app");
const PORT = process.env.PORT || 3055;

const server = app.listen(PORT, () => {
    console.log(`server start with ${PORT}`);
});

process.on("SIGINT", () => {
    console.log("Received SIGINT, shutting down gracefully...");
    server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
    });
});

process.on("SIGTERM", () => {
    console.log("Received SIGTERM, shutting down gracefully...");
    server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
    });
});