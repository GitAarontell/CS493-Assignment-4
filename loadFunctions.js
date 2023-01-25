const ds = require('./cloudDatastore');

const datastore = ds.datastore;
const LOAD = ds.LOAD;
const fromDatastore = ds.fromDatastore;

function get_loads(req) {
    let q = datastore.createQuery(LOAD).limit(3);
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

function get_load(id) {
    const key = datastore.key([LOAD, parseInt(id, 10)]);
    return datastore.get(key).then((entity) => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(fromDatastore);
        }
    });
}

function post_load(req, vol, item, date) {
    let key = datastore.key(LOAD);
    return datastore.save({ "key": key, "data": "" }).then(() => {
        let self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + key.id;
        const new_load = {"volume": vol, "carrier": null, "item": item, "creation_date": date, "self": self};
        return put_load(key.id, new_load).then(() => {
            new_load.id = key.id;
            return new_load});
    });
}

function put_load(id, data) {
    const key = datastore.key([LOAD, parseInt(id, 10)]);
    //const load = { "name": name, "type": type, "length": length };
    return datastore.save({ "key": key, "data": data });
}

function delete_load(id) {
    const key = datastore.key([LOAD, parseInt(id, 10)]);
    return datastore.delete(key);
}

module.exports = {get_loads, get_load, post_load, put_load, delete_load}