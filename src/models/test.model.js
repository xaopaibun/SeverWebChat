const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let TestChatSchema = new Schema({
    name: { type: String, default: "User" },
    content: String,
    socketID : String,
    createAt: { type: Number, default: Date.now() },
});

TestChatSchema.statics = {
    createChat(item){
        return this.create(item);
    },
    getChat(){
        return this.find({}).exec();
    }
}
module.exports = mongoose.model("testchat", TestChatSchema);
