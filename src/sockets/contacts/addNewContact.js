let addNewContact = io => {
    io.on("connection", (socket) => {
        socket.on("add-new-contact", (data) => {
            console.log(data);
        })
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

}
module.exports = addNewContact;