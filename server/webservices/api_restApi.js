var restApi = require('../webservices/restApi');
var express = require('express');
var router = express.Router();

module.exports = function (passport) {
    router.post('/login', passport.authenticate('basic',{"session":false}), function (req, res) {
        restApi.login(req, function (response) {
            res.json(response);
        });
    });
    
    router.post('/callDataList', function(req, res){
        restApi.callDataList(req, function(response){
            res.json(response);
        })
    });
    
    router.post('/getWebLeadScriptData', function(req, res){
        restApi.getWebLeadScriptData(req, function(response){
            res.json(response);
        })
    });
    
    router.post('/createWebLead', function(req, res){
        restApi.createWebLead(req, function(response){
            res.json(response);
        })
    });
    
    router.post('/webLead', function(req, res){
        restApi.webLead(req, function(response){
            res.json(response);
        })
    });
    
    return router;
}