import { ENV } from "../configs/env";
import transporter from "../configs/nodeMailer";
import { redisClient } from "../configs/redisUpstash";
import crypto from "crypto"
async function generateOtp(){
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
}
async function supportSendOtp(email, otp){
    try {
        const otp_pre = "otp:";
        const otp_attempt_pre = "otp_attempt:";
        const attempts = await redisClient.get(otp_attempt_pre + email);
        if (attempts && parseInt(attempts as string) >= 10) {
            throw new Error('Too many OTP requests. Please try again after 5 minutes.');
        }
        await redisClient.setEx(otp_pre + email, 60, otp);
        const cntAttempts = await redisClient.incr(otp_attempt_pre + email);
        if(cntAttempts == 1){
            await redisClient.expire(otp_attempt_pre + email, 300);
        }
        await transporter.sendMail({
            from: ENV.EMAIL_FROM,
            to: email,
            subject: "[ZUS CONFERENCE VIDEO SYSTEM] - OTP CODE",
            html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                        <style>
                            *{
                                margin: 0;
                                padding: 0;
                            }
                            .heading{
                                text-align: center;
                                color: blue;
                                border-bottom: 1px solid black;
                                margin-bottom: 4px;
                            }
                            .container{
                                width: 500px;
                                height: 500px;
                                padding: 4px;
                            }
                            .firstContent, .notice{
                                margin-top: 0;
                                line-height: 24px;
                            }
                            .otp{
                                text-align: center;
                                color: green;
                                font-size: 40px;
                            }
                            .content{
                                border-bottom: 1px solid black;
                            }
                            .footer{
                                text-align: right; 
                                font-style: italic; 
                                opacity: 0.6;
                                margin-top: 8px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div>
                                <h1 class="heading">Email OTP</h1>
                            </div>
                            <div class="content">
                                <p class="firstContent">Dear ${email},</p>
                                <p class="secondContent">We are ZUS'staff. Someone requested access to our website using your email. Your OTP is:</p>
                                <br>
                                <h1 class="otp">${otp}</h1>
                                <br>
                                <p class="thirdContent">Please use this OTP to access to our website. Thank you for using Email OTP</p>
                                <br>
                                <p class="notice" style="color:red">NOTICE: DO NOT SHARE THIS OTP WITH ANYONE</p>
                            </div>
                            <div class="footer">
                                © ZUS Conference Room System. All rights reserved.
                            </div>
                        </div>
                    </body>
                    </html>`
        })
        console.log("SEND OTP SUCCESSFULLY!");
        return { 
            success: true, 
            message: 'OTP sent successfully',
        };
    } catch (error) {
        console.error("SEND OTP FAILED!", error);
        throw error
    }
}

async function supportVerifyOtp(email, otp){
    try {
        if (!redisClient) {
            console.error("Redis client is not initialized.");
            return 1;
        }
        const otp_pre = "otp:";
        const redisOtp = await redisClient.get(otp_pre+email);
        if(!redisOtp){
            console.log("OTP is expired");
            return 2;
        }
        if(redisOtp !== otp){
            console.log("OTP is wrong");
            return 3;
        }
        await redisClient.del(otp_pre+email);
        return 4;
    } catch (error) {
        console.error("VERIFY OTP FAILED!", error);
    }
}
export {supportSendOtp, generateOtp, supportVerifyOtp}