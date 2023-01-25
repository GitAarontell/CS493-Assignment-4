const express = require('express');
const routerBoats = express.Router();
const boatfunc = require('./boatFunctions');
const loadfunc = require('./loadFunctions');

routerBoats.get('/', function (req, res) {
    const boats = boatfunc.get_boats(req)
        .then((boats) => {
            let boatArray = boats.items;
            let retObj = {"boats": boatArray};            
            res.status(200).json(retObj);
        });
});

routerBoats.get('/:id', function (req, res) {
    boat_id = req.params.id;
    boatfunc.get_boat(boat_id)
        .then(boatArray => {
            let boat = boatArray[0]
            if (boat === undefined || boat === null) {
                res.status(404).json({'Error':'No boat with this boat_id exists'});
            }
            res.status(200).json(boat);
        });
});

routerBoats.get('/:id/loads', function(req, res) {
    boatfunc.get_boat(req.params.id).then((boatArray) => {
        let boat = boatArray[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error":"No boat with this boat_id exists"});
        } else {
            res.status(200).send(boat);
        }
    });
});

routerBoats.post('/', function (req, res) {
    if (Object.keys(req.body).length == 3) {
        boatfunc.post_boat(req, req.body.name, req.body.type, req.body.length)
            .then(boat => {         
                res.status(201).send(boat) 
            });
    } else {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
    }
});

routerBoats.put('/:id/loads/:load_id', function (req, res) {
    let load_id = req.params.load_id;
    let id = req.params.id;
    
    boatfunc.get_boat(id).then((boatObj) => {
        let boat = boatObj[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error": "The specified boat and/or load does not exist"});
        }
        loadfunc.get_load(load_id).then((loadObj) => {
            let load = loadObj[0];
            if (load == undefined || load == null) {
                res.status(404).send({"Error": "The specified boat and/or load does not exist"});
            }
            if (load.carrier == null) {                     
                //delete load.id;
                load.carrier = {"id": id, "name": boat.name, "self": boat.self}
                loadfunc.put_load(load_id, load).then(()=> {
                    boat.loads.push(load);
                    boatfunc.put_boat(id, boat).then(() => {
                        res.status(204).end();
                    });                   
                });                   
            } else {
                res.status(403).send({"Error": "The load is already loaded on another boat"});
            }
        });
    });
        // is the load assigned to a boat already?
});
routerBoats.delete('/:id/loads/:load_id', function(req, res){
    console.log(req.params);
    res.end();
});
// routerBoats.delete('/:id/loads/:load_id', function (req, res) {
//     let id = req.params.id;
//     let load_id = req.params.load_id;
//     console.log(req.params.id);
//     res.send({"msg": "hello there"});
//     // get boat by id
//     boatfunc.get_boat(id).then((boatArray) => {
//         let boat = boatArray[0];
//         // if boat does not exist throw 404 error
//         if (boat === undefined || boat === null){
//             res.status(404).end({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
//         } else {
//             // get load by id
//             loadfunc.get_load(load_id).then((loadArray) => {
//                 let load = loadArray[0];
//                 // if load does not exist throw error
//                 console.log(load);
//                 if (loadArray[0] === undefined || loadArray[0] === null) {
//                     res.status(404).end({"Error": "No boat with this boat_id is loaded with the load with this load_id"});
//                 } else {
//                     if (load.carrier == null || load.carrier.id != id){res.status(404).send(
//                         {"Error":"No boat with this boat_id is loaded with the load with this load_id"});
//                     }
//                     // set the load object carrier to null
//                     load.carrier = null;
//                     // update load to have no carrier
//                     loadfunc.put_load(load_id, load).then(() => {
//                         // take load with matching id object out of boats object loads
//                         boatfunc.removeLoad(load_id, boat.loads);
//                         // update boat with new loads value and send status
//                         boatfunc.put_boat(id, boat).then(() => {res.status(204).end();});
//                     });
//                 }    
//             });
//         }
//     });
    
// });

routerBoats.delete('/:id', function (req, res) {
    boatfunc.get_boat(req.params.id).then((boatArray) => {
        let boat = boatArray[0];
        if (boat === undefined || boat === null){
            res.status(404).send({"Error": "No boat with this boat_id exists"});
        }
        // get all loads from boat
        let loads = boat.loads;
        // go through all the loads and set carrier to null with put request
        for (let i = 0; i < loads.length; i++){
            loadfunc.get_load(loads[i].id).then((loadArray) => {
                let load = loadArray[0];
                load.carrier = null;
                loadfunc.put_load(load.id, load).then(() => {return});
            });
        }
        // delete boat
        boatfunc.delete_boat(req.params.id).then(
            res.status(204).end())
        });
    
});

module.exports = routerBoats;