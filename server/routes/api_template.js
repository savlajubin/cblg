var Template = require('../controllers/template.js');
var express = require('express');
var router = express.Router();
//var phantom =require('phantom');

//save Email Template

router.post('/saveEmailTemplate', function(req, res, next) {
    Template.saveEmailTemplate(req,res,function(response){
        res.json(response);
    });
});
//Template List

router.get('/templateList', function(req, res, next) {
    Template.templateList(req,res,function(response){
    	res.json(response);
    });
});
// status Change
router.post('/changetemplatestatus',  function (req, res, next) {
    console.log("ksjdsjdlksj");
    Template.changetemplatestatus(req, res, function (response) {
        res.json(response);
    });
});
//delete Template list
router.get('/deleteTemplateList/:id', Template.deleteTemplateList);
//find Template
router.get('/findTemplate/:id' , function (req, res, next) {
        Template.findTemplate(req, res, function (response) {
            res.json(response);
        });
    });
 //Edit Template
 router.post('/editEmailTemplate', Template.editEmailTemplate);
//Get templateInfo
router.get('/template_Info/:id', function (req, res, next) {
        Template.template_Info(req, res, function (response) {
            console.log(response);
            res.json(response);
        });
    });
module.exports = router;
