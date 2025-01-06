const express = require("express");
const path = require("path");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const Rider = require("../model/rider");
const { isAuthenticated, isDelivery, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendRiderToken = require("../utils/riderToken");

function generatePublicId() {
  const timestamp = new Date().getTime(); // Get current timestamp
  const randomString = Math.random().toString(36).substring(7); // Generate a random string
  return `file_${timestamp}_${randomString}`; // Combine timestamp and random string

}

// create rider
router.post("/create-rider", catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body;
    const deliveryEmail = await Rider.findOne({ email });
    if (deliveryEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    // Upload avatar image
    const avatar = await cloudinary.uploader.upload(req.body.avatar, {
      folder: "avatars",
      public_id: generatePublicId() // Generate unique public ID for the avatar image
    });

    // Upload other images with unique public IDs
    const ghCardFrontCloud = await cloudinary.uploader.upload(req.body.ghcardfront, {
      folder: "ghcardfront",
      public_id: generatePublicId() // Generate unique public ID for the ghcardfront image
    });

    const ghCardBackCloud = await cloudinary.uploader.upload(req.body.ghcardback, {
      folder: "ghcardback",
      public_id: generatePublicId() // Generate unique public ID for the ghcardback image
    });

    const licenseFrontCloud = await cloudinary.uploader.upload(req.body.licensefront, {
      folder: "licensefront",
      public_id: generatePublicId() // Generate unique public ID for the licensefront image
    });

    const licenseBackCloud = await cloudinary.uploader.upload(req.body.licenseback, {
      folder: "licenseback",
      public_id: generatePublicId() // Generate unique public ID for the licenseback image
    });


    const delivery = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: {
        public_id: avatar.public_id,
        url: avatar.secure_url
      },
      ghcardfront: {
        public_id: ghCardFrontCloud.public_id,
        url: ghCardFrontCloud.secure_url
      },
      ghcardback: {
        public_id: ghCardBackCloud.public_id,
        url: ghCardBackCloud.secure_url
      },
      licensefront: {
        public_id: licenseFrontCloud.public_id,
        url: licenseFrontCloud.secure_url
      },
      licenseback: {
        public_id: licenseBackCloud.public_id,
        url: licenseBackCloud.secure_url
      },
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      carNumber: req.body.carNumber,
      
    };

    const activationToken = createActivationToken(delivery);

    const activationUrl = `https://fivestarwaakye-rider.vercel.app/delivery/activation/${activationToken}`;

    try {
      await sendMail({
        email: delivery.email,
        subject: "Activate Your Ride",
        message: `Hello ${delivery.name}, please click on the link to activate your ride: ${activationUrl}`,
      });
      res.status(200).json({
        success: true,
        message: `please check your email:- ${delivery.email} to activate your rider!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));

// create activation token
const createActivationToken = (delivery) => {
  return jwt.sign(delivery, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

// activate user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newDelivery = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newDelivery) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, address, phoneNumber, carNumber, ghcardfront, ghcardback, licensefront, licenseback   } =
        newDelivery;

      let delivery = await Rider.findOne({ email });

      if (delivery) {
        return next(new ErrorHandler("User already exists", 400));
      }

      delivery = await Rider.create({
        name,
        email,
        avatar,
        password,
        address,
        phoneNumber,
        carNumber, ghcardfront, ghcardback, licensefront, licenseback
      });

      sendRiderToken(delivery, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login rider
router.post(
  "/login-rider",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Rider.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendRiderToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load rider
router.get(
  "/getDelivery",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const delivery = await Rider.findById(req.delivery._id);

      if (!delivery) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        delivery,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// log out from rider
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("delivery_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get rider info
router.get(
  "/get-rider-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const rider = await Rider.findById(req.params.id);
      res.status(201).json({
        success: true,
        rider,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update rider profile picture
router.put(
  "/update-rider-avatar",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let existsDelivery = await Rider.findById(req.delivery._id);

        const imageId = existsDelivery.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
        });

        existsDelivery.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };

  
      await existsDelivery.save();

      res.status(200).json({
        success: true,
        delivery:existsDelivery,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update rider availability status
router.put(
  "/update-rider-availability",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Ensure request body contains the necessary data
      if (typeof req.body.isAvailable === 'undefined') {
        return res.status(400).json({ success: false, message: 'Missing isAvailable field in the request body' });
      }

      // Find the rider by ID
      const existsDelivery = await Rider.findById(req.delivery._id);

      // Check if the rider exists
      if (!existsDelivery) {
        return res.status(404).json({ success: false, message: 'Rider not found' });
      }

      // Update availability status
      existsDelivery.isAvailable = req.body.isAvailable;

      // Save the updated rider
      await existsDelivery.save();

      // Respond with success and updated rider data
      res.status(200).json({
        success: true,
        delivery: existsDelivery,
      });
    } catch (error) {
      // Handle errors gracefully
      console.error('Error updating rider availability:', error);
      return next(new ErrorHandler('Failed to update rider availability', 500));
    }
  })
);



// update delivery info
router.put(
  "/update-delivery-info",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber } = req.body;

      const rider = await Rider.findOne(req.delivery._id);

      if (!rider) {
        return next(new ErrorHandler("User not found", 400));
      }

      rider.name = name;
      rider.description = description;
      rider.address = address;
      rider.phoneNumber = phoneNumber;
      

      await rider.save();

      res.status(201).json({
        success: true,
        rider,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


//continously updating riders location 
router.put(
  "/rider/update-address",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {address } = req.body;

      const rider = await Rider.findOne(req.delivery._id);

      if (!rider) {
        return next(new ErrorHandler("User not found", 400));
      }

      rider.address = address;
      await rider.save();

      res.status(201).json({
        success: true,
        message: "Address updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);



// all deliverys --- for admin
router.get(
  "/admin-all-deliverys",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const deliverys = await Rider.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        deliverys,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// all-riders no authentication
router.get("/all-riders", async (req, res, next) => {
  try {
    const delivery  = await Rider.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      delivery,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// delete delivery ---admin
router.delete(
  "/delete-delivery/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const delivery = await Rider.findById(req.params.id);

      if (!delivery) {
        return next(
          new ErrorHandler("Delivery is not available with this id", 400)
        );
      }

      await Rider.findByIdAndDelete(req.params.id);

      res.status(201).json({
        success: true,
        message: "Delivery deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update delivery withdraw methods --- deliverys
router.put(
  "/update-payment-methods",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const delivery = await Rider.findByIdAndUpdate(req.delivery._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        delivery,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// delete delivery withdraw merthods --- only delivery
router.delete(
  "/delete-withdraw-method/",
  isDelivery,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const delivery = await Rider.findById(req.delivery._id);

      if (!delivery) {
        return next(new ErrorHandler("Delivery not found with this id", 400));
      }

      delivery.withdrawMethod = null;

      await delivery.save();

      res.status(201).json({
        success: true,
        delivery,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
