const express = require('express');
const routerLoads = express.Router();
const loadfunc = require('./loadFunctions');
const boatfunc = require('./boatFunctions');

routerLoads.get('/', function (req, res) {
    const Loads = loadfunc.get_loads(req)
        .then((Loads) => {
            let loadArray = Loads.items;
            let retObj = {"loads": loadArray}
            res.status(200).json(retObj);
        });
});

routerLoads.get('/:id', function (req, res) {
    load_id = req.params.id;
    loadfunc.get_load(load_id)
        .then(load => {
            if (load[0] === undefined || load[0] === null) {
                res.status(404).json({ 'Error': 'No load with this load_id exists' });
            } else {
                res.status(200).json(load[0]);
            }
        });
});

routerLoads.post('/', function (req, res) {
    if (Object.keys(req.body).length == 3) {
        loadfunc.post_load(req, req.body.volume, req.body.item, req.body.creation_date)
            .then(load => {         
                res.status(201).send(load) 
            });
    } else {
        res.status(400).send({"Error": "The request object is missing at least one of the required attributes"});
    }
});

routerLoads.delete('/:id', function (req, res) {
    loadfunc.get_load(req.params.id).then( (loadArray) => {
        let load = loadArray[0];
        if (load === undefined || load === null){
            res.status(404).send({"Error": "No load with this load_id exists"});
        }
        // get boat this load is being carried by if it is being carried
        if (load.carrier != null){
            // get boat
            boatfunc.get_boat(load.carrier.id).then((boatArray) => {
                let boat = boatArray[0];
                if (boat === undefined || boat === null){ 
                    res.status(404).send({"Error": "No boat with this id"});
                };
                // remove the load from boat object
                boatfunc.removeLoad(load.id, boat.loads);
                // updates boat to delete that load
                boatfunc.put_boat(boat.id, boat).then(() => {return});
            });
        }
        // if this load is not in a slip then delete
        loadfunc.delete_load(req.params.id).then(
            res.status(204).end())
        
        });
    
});

module.exports = routerLoads;