var fs = require('fs');
let path = require("path");

const pathImages = (req, res) => {
    const fileName = req.params.name;
    if (!fileName) {
        return res.send({
            status: false,
            message: 'no filename specified',
        })
    }
    res.sendFile(path.resolve(`./images/${fileName}`));
}



const UploadImages = (req, res) => {
    const processedFile = req.file || {}; // MULTER xử lý và gắn đối tượng FILE vào req
    let orgName = processedFile.originalname || ''; // Tên gốc trong máy tính của người upload
    orgName = orgName.trim().replace(/ /g, "-")
    const fullPathInServ = processedFile.path; // Đường dẫn đầy đủ của file vừa đc upload lên server
    // Đổi tên của file vừa upload lên, vì multer đang đặt default ko có đuôi file
    const newFullPath = `${fullPathInServ}-${orgName}`;
    fs.renameSync(fullPathInServ, newFullPath);
    res.send({
        status: true,
        message: 'file uploaded',
        fileNameInServer: newFullPath
    })
}



 
module.exports = {
    pathImages: pathImages,
    UploadImages :UploadImages,
}