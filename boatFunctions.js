const ds = require('./cloudDatastore');
const datastore = ds.datastore;
const BOAT = ds.BOAT;
const fromDatastore = ds.fromDatastore;

function get_boats(req) {
    let q = datastore.createQuery(BOAT).limit(3);
    const results = {};   
    if(Object.keys(req.query).includes("cursor")){
        q = q.start(req.query.cursor);
    }
    return datastore.runQuery(q).then((entities) => {
        results.items = entities[0].map(fromDatastore);
        if(entities[1].moreResults !== datastore.NO_MORE_RESULTS ){
            
            results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + encodeURIComponent(entities[1].endCursor);
        }
        return results;
    });
}

function get_boat(id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.get(key).then((entity) => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(fromDatastore);
        }
    });
}

function post_boat(req, name, type, length) {
    let key = datastore.key(BOAT);
    return datastore.save({ "key": key, "data": "" }).then(() => {
        let self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + key.id;
        const new_boat = {"name": name, "type": type, "length": length, "loads": [], "self": self};
        return put_boat(key.id, new_boat).then(() => {
            new_boat.id = key.id;
            return new_boat});
    });
}

function put_boat(id, data) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    //const was_data_before = { "name": name, "type": type, "length": length };
    return datastore.save({ "key": key, "data": data });
}

function delete_boat(id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.delete(key);
}

function removeLoad(load_id, loads){
    for(let i = 0; i < loads.length; i++){
        if (loads[i].id == load_id){
            loads.splice(i, i+1);
        }
    }
}

module.exports = {get_boats, get_boat, post_boat, put_boat, delete_boat, removeLoad}