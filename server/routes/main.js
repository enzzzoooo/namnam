const express = require('express')
const router = express.Router()

//connect the database model
const Restaurant = require('../models/restaurant')
const Reviews = require('../models/reviews')
const User = require('../models/profile')

// HOME route
router.get('/', async(req, res) => {
    try {
        const fetchedResturants = await Restaurant.find();
        
        // Calculate the average review for each restaurant
        const avgReviews = await Reviews.aggregate([
            {
              $group: {
                _id: "$restaurantId",
                avgRating: { $avg: "$starRating" } 
              },
            },
        ]);

        // Ensure the averages are easy to match with restaurants
        const reviewMap = new Map();
        avgReviews.forEach(review => {
            reviewMap.set(review._id.toString(), review.avgRating);
        });

        // We're creating a new Object for each restaurant with existing object spread and adding a new field avgRating
        const updatedRestaurants = fetchedResturants.map(restaurant => ({
            ...restaurant._doc,
            avgRating: Math.round(reviewMap.get(restaurant._id.toString()) || 0) // if no review yet, set rating 0
        }));

        res.render('index', { restaurants: updatedRestaurants })
    } catch (error) {
        console.log(error)
    }
})

//register route
router.post('/register', async(req, res) => {
    try {
        let username = req.body.username
        let password = req.body.password
        let displayName = req.body.displayName
        let description = req.body.description
        let displayPhotoUrl = req.body.displayPhotoUrl
        let userType = "user"

        await User.create({
            username,
            password,
            displayName,
            userType,
            displayPhotoUrl,
            description
        });

        res.redirect(`/login`);
    } catch (error) {
        console.log(error)
    }
})

//restaurant route
router.get('/restaurant/:id', async(req, res) => {
    try {
        const fetchedRestaurant = await Restaurant.findById(req.params.id);

        console.log(fetchedRestaurant)

        if (!fetchedRestaurant) {
            res.status(404).send('Restaurant not found');
            return;
        }

        const reviews = await Reviews.find({
            restaurantId: fetchedRestaurant.id,
        });

        console.log(reviews)

        let users = await User.find({
            _id: reviews.map(review => review.userId)
        })

        let reviewsWithUser = reviews.map(review => {
            let user = users.find(user => user._id.toString() === review.userId.toString())
            return {
                ...review._doc,
                user
            }
        })

        console.log(users)
        
        const total = reviews.reduce((acc, curr) => (
            acc + curr.starRating
        ), 0)
        const averageReview = Math.round(total / reviews.length);

        const restaurant = {
            ...fetchedRestaurant._doc,
            avgRating: averageReview,

        }
        console.log('REVIEWSWITHUSER',reviewsWithUser,'END')
        
        res.render('restaurant', { restaurant, reviews, reviewsWithUser })
    } catch (error) {
        console.log(error)
    }
})

// profile route
router.get('/profile/:id', async(req, res) => {
    try {
        const userprofile = await User.findById(req.params.id);
        const reviews = await Reviews.find({
            userId: userprofile.id,
        });

        const restaurantsProfile = await Restaurant.find({
        });

        console.log(res.locals.user)
        console.log(userprofile)
        let signedInUser = res.locals.user;
        console.log(signedInUser._id.toString())
        console.log(userprofile._id.toString())
        // stringigy the object id

        console.log(signedInUser._id.toString() == userprofile._id.toString())


        res.render('profile', { userprofile, reviews, restaurantsProfile, signedInUser })
    } catch (error) {
        console.log(error)
    }
})

// profilesettings route
router.get('/profilesettings', async(req, res) => {
    try {
        let signedInUser = res.locals.user;
        let userprofile = await User.findById(signedInUser._id);
        res.render('profilesettings', { userprofile })
    }
    catch (error) {
        console.log(error)
    }
})

// profilesettings patch route
router.post('/profilesettings', async(req, res) => {
    try {


        let signedInUser = res.locals.user;
        let userprofile = await User.findById(signedInUser._id);
        userprofile.displayName = req.body.displayName;
        userprofile.password = req.body.password;
        userprofile.displayPhotoUrl = req.body.displayPhotoUrl;
        console.log('DUMADAAN BA SIYA DITO')
        console.log(userprofile)
        await User.findByIdAndUpdate(signedInUser._id, userprofile);
        console.log(User.findById(signedInUser._id))
        res.redirect(`/profile/${signedInUser._id.toString()}`);
    }
    catch (error) {
        console.log(error)
    }
})


router.post('/reviews/:id', async (req, res) => {
    const { userId, starRating, review, reviewPhotoUrl } = req.body;
    const restaurantId = req.params.id;
    const restaurantIdredict = `/restaurant/${restaurantId}`

    //Create review in our database
    try {
        const reviewDoc = await Reviews.create({
            userId,
            restaurantId,
            starRating,
            review,
            reviewPhotoUrl
        });

        res.redirect(`/restaurant/${restaurantId}`);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
})

//profile route
router.get('/profile/:id', async(req, res) => {
    try {
        const profile = await User.findById(req.params.id);
        const reviews = await Reviews.find({
            userId: profile.id,
        });

        res.render('profile', { profile, reviews })
    } catch (error) {
        console.log(error)
    }
})

// login route
router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/register', async(req, res) => {
    res.render('register')
})

router.get('/reviews/:id', async(req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId);
        
        if (!restaurant) {
            res.status(404).send('Restaurant not found');
            return;
        }
        
        
        // pass the restaurant details to the review form
        res.render('review', { restaurant });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
})

// review edit
router.get('/reviews/:id/edit', async(req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId);

        let userReview = await Reviews.findOne({
            userId: res.locals.user._id,
            restaurantId: restaurantId
        })

        res.render(`reviewedit`, { restaurant, userReview });
    }
    catch (error) {
        console.log(error)
    }
})

router.post('/reviews/:id/edit', async (req, res) => {
    const { userId, starRating, review, reviewPhotoUrl } = req.body;
    const restaurantId = req.params.id;
    const restaurantIdredict = `/restaurant/${restaurantId}`

    //update review in our database

    try {
        const reviewDoc = await Reviews.findOneAndUpdate({
            userId: userId,
            restaurantId: restaurantId
        }, {
            userId,
            restaurantId,
            starRating,
            review,
            reviewPhotoUrl
        });

        res.redirect(`/restaurant/${restaurantId}`);
    } catch(err) {
        console.error(err);
        res.status(500).send('Server error');
    }
})

// review delete
router.get('/reviews/:id/delete', async(req, res) => {
    try {
        const restaurantId = req.params.id;

        const reviewDel = await Reviews.findOneAndDelete({
            userId: res.locals.user._id,
            restaurantId: restaurantId
        })

        res.redirect(`/restaurant/${restaurantId}`);
    }
    catch (error) {
        console.log(error)
    }
})




// function insertRestaurantData () {
//     Restaurant.insertMany([
//         {
//             restaurantName: 'Tinuhog ni Benny',
//             description: 'Tinuhog ni Benny so good',
//             averageRating: 3,
//             picture: "https://images.deliveryhero.io/image/fd-ph/LH/i6oe-listing.jpg"
//         },
//         {
//             restaurantName: 'Thai Mango',
//             description: 'Thai Mango so good',
//             averageRating: 3,
//             picture: "https://d1sag4ddilekf6.cloudfront.net/compressed_webp/items/PHITE20200205072310039166/detail/713f3d0303b94a35ba0781a9d53d52d4_1637922854105001220.webp"
//         },
//     ])
// }

// insertRestaurantData()

// function insertRestaurantData () {
//     Restaurant.insertMany([
//         {
//             restaurantName: '24 Chicken',
//             description: '24 Chickken so good',
//             averageRating: 3,
//             picture: "24%20Chix.jpg"
//         },
//         {
//             restaurantName: 'Chomp Chomp',
//             description: 'chompyyyyyyyyy',
//             averageRating: 3,
//             picture: "chomp%20(1).jpeg"
//         },
//         {
//             restaurantName: 'El Poco',
//             description: 'have no idea what this restaurant is abotu',
//             averageRating: 3,
//             picture: "el%20poco%20(1).jpeg"
//         }
        
//     ])
// }

// insertRestaurantData()


//export
module.exports = router