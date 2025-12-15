
import appError from "../utils/appError.js";
const allowedTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.currentUser.role)){
            return next(appError.create('this role is not authorized ',401));
        }
            next();
    }
}

export default allowedTo;