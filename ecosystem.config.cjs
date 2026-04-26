module.exports = {
    apps: [{
        name: "QOTD_Bot",
        script: "./app.ts",
        // We tell PM2 to use the standard node binary
        interpreter: "node",
        // We pass the loader flags specifically as node arguments
        node_args: "--loader ts-node/esm",
        watch: true
    }]
}