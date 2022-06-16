db.getCollection("jobs").createIndex({ "_id.country": 1 });
db.getCollection("jobs").createIndex({ "_id.location": 1 });

db.getCollection("salaries").createIndex({ "_id.country": 1 });
db.getCollection("salaries").createIndex({ "_id.location": 1 });
