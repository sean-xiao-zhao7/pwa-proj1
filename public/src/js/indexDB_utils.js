const postsIdb = idb.openDB("dynamicIdbCache", 1, {
    upgrade(db) {
        db.createObjectStore("posts", {
            keyPath: "id",
            autoIncrement: true,
        });
    },
});

const putResponseToIDB = (res) => {
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
    postsIdb.then((dbInstance) => {
        const result = dbInstance.get("posts");
        return result;
    });
};
