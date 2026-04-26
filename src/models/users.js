import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        firstName: {

            type: String,
            required: true,
        },
        lastName:{
            type:String,
            required:true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone:{
        type:String,
    },
    password: {
        type: String,
        required: true,
    },
    address:{
        street:{
          type:String,
          default:""
        },
        city:{
          type:String,
          default:""
        },
        state:{
          type:String,
          default:""
        },
        zipcode:{
          type:String,
          default:""
        },
        country:{
          type:String,
          default:""
        }
      },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model("User", userSchema);

export default User;