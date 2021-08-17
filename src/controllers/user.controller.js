const userModel = require('../models/user.model');
const md5 = require('md5')
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');

async function main(gmail, subject, text) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'phamjin303@gmail.com',
            pass: '01652343938',
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let info = await transporter.sendMail({
        from: 'phamjin303@gmail.com',
        to: gmail,
        subject: subject,
        text: text,
    });
}
const GenerateToken = (data, time) => {
    let token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: time });
    return token;
}


const DecodeToken = (token) => {
    let data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    return data;
}

const signup = async (req, res, next) => {
    try {
        if (await userModel.findByEmail(req.body.gmail)) {
            res.status(201).send({ message: 'Tai khoan da ton tai' })
        }
        else {
            let user = {
                local: {
                    email: req.body.gmail, password: md5(req.body.password), confirmpassword: md5(req.body.confirmpassword)
                }
            }
            await userModel.create(user)
            const OTP = Math.floor(Math.random() * 999999 - 100000) + 100000;
            main(req.body.gmail, "Xac Nhan Ma OTP Example Chat Socket", "Ma xac nhan dang ky tai khoan cua ban la : "
            + OTP +
            ". Hotline ho tro : 035.234.3938").catch(console.error);
            let accessToken = GenerateToken({ gmail: req.body.gmail, OTP: OTP }, '60s');
            res.status(200).send({ message: 'Success', accessToken: accessToken });

        }
    } catch (error) {
        res.status(401).send({ message: 'error' });
    }
}

const login = async(req, res, next) => {
    try {
        const user = await userModel.checkUser(req.body.gmail, md5(req.body.password));
       
        if (user) {
            let accessToken = await GenerateToken({gmail : req.body.gmail}, '3600s');
            res.status(200).send({ message: 'Login Success',accessToken : accessToken  })
        }
        else if(await userModel.findByEmail(req.body.gmail)){
            res.status(201).send({ message: 'Login Failed, Account is not active!' });
        }
        else {
            res.status(202).send({ message: 'Dang nhap that bai do sai tai khoan' });
        }
    } catch (error) {
        res.status(401).send({ message: 'error' });
    }
}

const loginFb = async (req, res, next) => {
    try {
        let userFB = req.body.FB;
        if (await userModel.findByFacebookUid(userFB.userID)) {
            console.log('da co uid')
            res.send({ message: 'Success', data:  userModel.findByFacebookUid(userFB.userID)});
        }
        else {
            let userFb = {
                username: userFB.name,
                avatar: userFB.picture.data.url,
                facebook: {
                    uid: userFB.userID,
                    token: userFB.accessToken,
                    email: userFB.email,
                },
                local: {
                    isActive: true
                }
            }
            await userModel.create(userFb)
            res.send({ message: 'Success', data: userFb });
        }
    } catch (error) {
        res.status(401).send({ message: 'error' });
    }
}

const sendGmail = async (req, res, next) => {
    try {
        const OTP = Math.floor(Math.random() * 999999 - 100000) + 1000000;
        main(req.body.gmail, OTP).catch(console.error);
        let accessToken = GenerateToken({ gmail: req.body.gmail, OTP: OTP });
        res.send({ message: 'Success', accessToken: accessToken });
    } catch (error) {
        res.status(401).send({ message: 'error' });
    }
}

const UpdateUser = async (req, res, next) => {
    try {
        const data = await DecodeToken(req.headers['authorization'].split(' ')[1]);
        await userModel.findByUserAndUpdateUser(data.gmail, req.body);
        res.status(200).send({ message: 'Update Success'});
    } catch (error) {
        res.status(201).send({ message: 'Update Failed'});
    }
}

const checkOTP = async (req, res, next) => {
    try {
        //req.headers['authorization'].split(' ')[1]
        const data = await DecodeToken(req.body.tokenOTP);
        // data.gmail == req.body.gmail && 
        if (data.OTP == req.body.OTP) {
            await userModel.findByEmailAndUpdateActive(data.gmail);
            res.status(200).send({ message: 'Verify OTP Success' });
        }
        else {
            res.status(201).send({ message: 'Verify OTP Error' });
        }
    } catch (error) {
        res.status(400).send({ message: "Invalid Token" });
    }
}


const resetPassword = async (req, res, next) => {
    try {
        const Password = Until.RandomText(6);
        await main(req.body.gmail, "Reset Password Example Chat", "Mat khau moi tai khoan cua ban la : "
        + Password +
        ". Hotline ho tro : 035.234.3938").catch(console.error);
        await userModel.findByUserAndResetPassword(req.body.gmail, Password)
        res.send({ message: 'Reset Success' });
    } catch (error) {
        res.status(401).send({ message: "Reset Password Failed" });
    }
}


const findUser = async (req, res, next) => {
    try {
        if(await userModel.findByUsername(req.body.username)){
            const { _id, avatar, username } = await userModel.findByUsername(req.body.username);
            res.send({ message: 'Find User Success',data : {_id, avatar, username}  });
        }
        else{
            res.send({ message: 'Find Not User'  });
        }
    } catch (error) {
        res.status(401).send({ message: "Find User Failed" });
    }
}

module.exports = {
    signup: signup,
    loginFb: loginFb,
    login: login,
    sendGmail: sendGmail,
    checkOTP: checkOTP,
    UpdateUser : UpdateUser,
    resetPassword : resetPassword,
    findUser : findUser
}