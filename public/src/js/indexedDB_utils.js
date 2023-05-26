const clearAllIDB = () => {
    postsIdb.then((dbInstance) => {
        dbInstance.clear("posts");
    });
};

const postsIdb = idb.openDB("dynamicIdbCache", 1, {
    upgrade(db) {
        db.createObjectStore("posts", {
            keyPath: "id",
            autoIncrement: true,
        });
    },
});

const putResponseToIDB = (res) => {
    clearAllIDB();
    const resClone = res.clone();
    resClone.json().then((result) => {
        for (const post of Object.values(result)) {
            postsIdb.then((dbInstance) => {
                dbInstance.put("posts", post);
            });
        }
    });
    return res;
};

const readAllFromIDB = () => {
    return postsIdb.then((dbInstance) => {
        const result = dbInstance.getAll("posts");
        return result;
    });
};
