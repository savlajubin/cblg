var express = require('express');
var router = express.Router();
var roles = require('../controllers/role');     //To manage user roles
var verticals = require('../controllers/vertical'); //To manage verticals
var categories = require('../controllers/category'); //To manage categories
// route middleware to make sure a user is logged in (shivansh)
function isAuthenticatedRequest(req, res, next) {
// if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}

// get article list
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Home'});
});

/*=======================  Role management system =============================*/

// post request for add role
router.post('/addRole', isAuthenticatedRequest, function (req, res, next) {
    roles.addRole(req, res, function (response) {
        res.json(response);
    });
});

// post request for edit role
router.post('/editRole', isAuthenticatedRequest, function (req, res, next) {
    roles.editRole(req, res, function (response) {
        res.json(response);
    });
});

// post request for change status of role
router.post('/statusRole', isAuthenticatedRequest, function (req, res, next) {
    roles.statusRole(req, res, function (response) {
        res.json(response);
    });
});

// post request for find specific role
router.get('/findRole/:id', isAuthenticatedRequest, function (req, res, next) {
    roles.findRole(req, res, function (response) {
        res.json(response);
    });
});

// get request for find all role
router.get('/listRole', isAuthenticatedRequest, function (req, res, next) {
    roles.listRole(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all role
router.post('/deleteRole', isAuthenticatedRequest, function (req, res, next) {
    roles.deleteRole(req, res, function (response) {
        res.json(response);
    });
});

/* ============================== vertical management section ===========================*/

// post request for add vertical
router.post('/addVertical', isAuthenticatedRequest, function (req, res, next) {
    verticals.addVertical(req, res, function (response) {
        res.json(response);
    });
});

// post request for edit vertical
router.post('/editVertical', isAuthenticatedRequest, function (req, res, next) {
    verticals.editVertical(req, res, function (response) {
        res.json(response);
    });
});

// post request for change status of vertical
router.post('/statusVertical', isAuthenticatedRequest, function (req, res, next) {
    verticals.statusVertical(req, res, function (response) {
        res.json(response);
    });
});

// get request for find specific vertical
router.get('/findVertical/:id', isAuthenticatedRequest, function (req, res, next) {
    verticals.findVertical(req, res, function (response) {
        res.json(response);
    });
});

// get request for find all vertical
router.get('/listVertical', isAuthenticatedRequest, function (req, res, next) {
    verticals.listVertical(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all vertical
router.post('/deleteVertical', isAuthenticatedRequest, function (req, res, next) {
    verticals.deleteVertical(req, res, function (response) {
        res.json(response);
    });
});


/* ============================== categories management section ===========================*/
// post request for add category
router.post('/addCategory', isAuthenticatedRequest, function (req, res, next) {
    categories.addCategory(req, res, function (response) {
        res.json(response);
    });
});

// post request for edit category
router.post('/editCategory', isAuthenticatedRequest, function (req, res, next) {
    categories.editCategory(req, res, function (response) {
        res.json(response);
    });
});

// post request for change status of category
router.post('/statusCategory', isAuthenticatedRequest, function (req, res, next) {
    categories.statusCategory(req, res, function (response) {
        res.json(response);
    });
});


// get request for find specific category
router.get('/findCategory/:id', isAuthenticatedRequest, function (req, res, next) {
    categories.findCategory(req, res, function (response) {
        res.json(response);
    });
});


// get request for find specific category
router.get('/listCategoryByVertical/:id', isAuthenticatedRequest, function (req, res, next) {
    categories.findCategoryByVertical(req, res, function (response) {
        res.json(response);
    });
});


// get request for find all category
router.get('/listCategory', isAuthenticatedRequest, function (req, res, next) {
    categories.listCategory(req, res, function (response) {
        res.json(response);
    });
});

// get request for find all category by user specific
router.get('/listCategoryByUser', isAuthenticatedRequest, function (req, res, next) {
    categories.listCategoryByUser(req, res, function (response) {
        res.json(response);
    });
});

// post request for find all category
router.post('/deleteCategory', isAuthenticatedRequest, function (req, res, next) {
    categories.deleteCategory(req, res, function (response) {
        res.json(response);
    });
});


module.exports = router;