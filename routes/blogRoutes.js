const express = require('express');
const Blog = require('../models/blog');

const router = express.Router();

/// routes
router.get('/', (req,res) =>{
        res.redirect('/blogs')
});
router.get('/about', (req,res) =>{

    res.render('about' , {title: 'About'});
});

router.get('/blogs' ,(req , res) => {
    Blog.find()
    .then((result) => {
        res.render('index' , { title: 'All BLOGS' , blogs: result});
    })
    .catch((err) => {
        console.log(err);
    });

});
router.post('/blogs',(req, res) => {
    const blog = new Blog(req.body);

    blog.save()
        .then((result) => {
            res.redirect('/blogs');
        })
        .catch((err) => {
            console.log(err);
        });
});

// redirect page 
router.get('/about-us', (req , res) => {
    res.redirect('/about');
})
// create blogs page 
router.get('/blogs/create' , (req , res) => {
    res.render('create' , {title: 'Create'});
  })

/// gettting id 
router.get('/blogs/:id', (req,res) => {
    const id = req.params.id
    Blog.findById(id)
    .then(result => {
        res.render('details' , {blog: result , title:'Blogs details' })
    })
    .catch((err) => {
        console.log(err);
    })
});
/// deleting id 
router.delete('/blogs/:id', (req,res) =>{
    const id = req.params.id;

    Blog.findByIdAndDelete(id)
        .then(result => {
            res.json({redirect:'/blogs'});
        })
        .catch(err =>{
            console.log(err);
            res.status(500).send("Error deleting blog");
        })
})


module.exports = router;