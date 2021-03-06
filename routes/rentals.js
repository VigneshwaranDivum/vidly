const {Rental,validate} = require('../models/rental');
const {Movie} = require('../models/movie');
const {Customer} = require('../models/customer');
const express = require('express');
const mongoose = require('mongoose');
// const Fawn = require('fawn');
const router = express.Router();

// Fawn.init(mongoose);


router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});


router.post('/', async (req, res) => {
  const {error} = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Not an Valid Customer');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Not an Valid Movie');

  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone

    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    },
    // rentalFee: req.body.rentalFee
  });

  // try {
  //   new Fawn.Task()
  // .save('rentals',rental)
  // .update('movies',{_id: movie._id},{
  //   $inc:{numberInStock:-1}
  // })
  // .run();

  // res.send(rental);
  // } catch (error) {
  //   res.status(500).send('Something Failed.');
  // }
  
  await rental.save();
  movie.numberInStock--;
  movie.save();
  res.send(rental);
  
});


router.delete('/',async (req, res)=>{
  const rentals = await Rental.findByIdAndRemove(req.params.id);
  if (!rentals)
    return res.status(404).send("The rental with the given ID was not found.");
  res.send(rentals)
});



module.exports = router;