var config = require('../../config/constant.js'); // constants
var Vertical = require('../models/vertical'); //To deal with vertical collection data
var Category = require('../models/category');//To deal with category collection data


/* @function : isEmptyObject 
*  @Creator  : shivansh
*  @created  : 09072015
*/

var isEmptyObject = function (obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}


/* @function : addVertical 
*  @created  : 09072015
*  @modified : shivansh
*  @purpose  : Add vertical in the system 
*/
var addVertical = function(req, res, done){	    

    var newVertical = new Vertical();
    newVertical.vertical_name =  req.body.name;
    newVertical.vertical_description = req.body.description;
    newVertical.vertical_status = req.body.status;   
    // newVertical.created_by = "559fd9da1c723c4a41c60cb1";   // logged in user id // TO DO (req.user._id)
    newVertical.created_by = req.user._id; 

    newVertical.save(function(err) {
        if (err){
        	 return done({"code":config.constant.CODES.notFound, "data":false, "message" : config.constant.MESSAGES.Error});              
        }
        return done({"code":config.constant.CODES.OK, "data": newVertical, "message" : config.constant.MESSAGES.saveSuccess });
    });	
}
module.exports.addVertical = addVertical;


/* @function : editVertical 
*  @created  : 11072015
*  @modified : 
*  @purpose  : edit module in the system
*/
var editVertical = function(req, res,callback){   
    
    var updateData={
        'vertical_name': req.body.name,
        'modified' : Date.now()
    }
    var vertical_id= req.body._id;     
    Vertical.update({_id:vertical_id},{$set:updateData},function (err){
        if(err){
            console.log("System Error (editVertical) : "+err);
            callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error});
        }else{
            callback({'code':config.constant.CODES.OK,"message":config.constant.MESSAGES.updateSuccess});
        }
    });
}
module.exports.editVertical = editVertical;


/* @function : statusVertical 
*  @created  : 11072015
*  @modified : 
*  @purpose  : change status of module in the system  (true,false)
*/
var statusVertical = function(req, res,callback){ 
    var updateData={
        'vertical_status' :req.body.status,
        'modified' : Date.now()
    }
    var vertical_id= req.body.vertical_id;     
    Vertical.update({_id:vertical_id},{$set:updateData},function (err){
        if(err){
            console.log("System Error (Vertical Status) : "+err);
            callback({'code':config.constant.CODES.notFound,"message":config.constant.MESSAGES.Error});
        }else{
            listVertical(req,res,function(response){
                callback({'code':config.constant.CODES.OK,"data":response.data,"message":config.constant.MESSAGES.statusSuccess});
            });

        }
    });
}
module.exports.statusVertical = statusVertical;


/* @function : findVertical 
*  @created  : 11072015
*  @modified : 
*  @purpose  : find vertical in the system
*/
var findVertical = function(req, res,callback){   
    Vertical.findOne({ '_id' :  req.params.id,'isdeleted': false }).exec(function(err, vertical) {
        if(err){
            console.log("System Error (findVertical) : "+err);
            callback({'code':config.constant.CODES.notFound, "data":null, "message":config.constant.MESSAGES.Error});
        }else{          
            if(isEmptyObject(vertical)){
                callback({'code':config.constant.CODES.notFound, "data":'', "message":config.constant.MESSAGES.notFound});  
            }else{
                callback({'code':config.constant.CODES.OK, "data":vertical, "message":config.constant.MESSAGES.Success});    
            }            
        }
    });
}
module.exports.findVertical = findVertical;


/* @function : listVertical 
*  @created  : 11072015
*  @modified : 
*  @purpose  : list vertical in the system
*/
var listVertical = function(req, res,callback){   
    Vertical.find({'isdeleted': false},function(err, vertical) {
        if(err){
            console.log("System Error (listVertical) : "+err);
            callback({'code':config.constant.CODES.notFound, "data":null, "message":config.constant.MESSAGES.Error});
        }else{
            if(isEmptyObject(vertical)){
                callback({'code':config.constant.CODES.notFound, "data":'', "message":config.constant.MESSAGES.notFound});  
            }else{
                callback({'code':config.constant.CODES.OK, "data":vertical, "message":config.constant.MESSAGES.Success});    
            }            
        }
    });
}
module.exports.listVertical = listVertical;



/* @function : deleteVertical 
*  @created  : 11072015
*  @modified : 
*  @purpose  : delete the vertical from the system  (true,false)
*/

var deleteVertical = function(req, res,callback){
    var collection_verticalArr=req.body.vertical_ids;

    Category.find({vertical_id: collection_verticalArr[0].id,isdeleted : false},function(err,response){
        if(err){
             callback({'code':config.constant.CODES.notFound, "data":null, "message":config.constant.MESSAGES.Error});
        }else{
            if(isEmptyObject(response)){
                Vertical.update({_id:collection_verticalArr[0].id},{$set:{'isdeleted':true,'modified':Date.now()}},
                function(err){
                          if(err){
                            console.log("error :"+err);

                          }else{
                                listVertical(req,res,function(response){
                                callback({'code':config.constant.CODES.OK,"data":response.data,"message":config.constant.MESSAGES.deleteSuccess});
                                });
                              }
                });
            }
            else
            {
                callback({'code':config.constant.CODES.notFound, "message":config.constant.MESSAGES.verticalAlreadyExist});
            }
           }
    });
}
module.exports.deleteVertical = deleteVertical;