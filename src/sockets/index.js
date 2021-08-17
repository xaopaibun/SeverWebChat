const addNewContact = require("./contacts/addNewContact");

let initSockets = io =>{
    addNewContact(io);
}
module.exports = initSockets;