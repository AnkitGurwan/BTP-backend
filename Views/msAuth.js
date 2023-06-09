import express from "express"
import { login, getToken } from "../Controllers/msAuthController.js";
// const passport = require('passport');
import { routes } from "../routes.js";


const authRouter = express.Router();
 

authRouter.get(routes.microsoft,login);
authRouter.get(routes.microsoft + "/getToken", getToken);
// authRouter.get(
//   routes.microsoftCallback,
//   passport.authenticate('microsoft', { failureRedirect: '/user-info' }),
//   controllers.authController.postMicrosoftLogin,
// );

export default  authRouter ;