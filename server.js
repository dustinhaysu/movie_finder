//app creates an auto complete list

const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId } = require('mongodb')
const { res } = require('express')
const { req } = require('http')

require('dotenv').config()
const PORT = 9000

let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr) 
    .then(client => {
        console.log('Connected to the database')
        db = client.db(dbName)
        collection = db.collection('movies')
    })

    // MIDDLEWARE
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())
    app.use(cors())
//

app.get("/search", async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                "$search" : {
                    "autocomplete" : {
                        "query" : `${req.query.query}`,
                        "path" : "title",
                        "fuzzy" : {
                            "maxEdits" : 2,
                            "prefixLength" : 3

                        }


                    }

                }

            }

        ]).toArray()
        console.log(result)
        res.send(result)
    } catch(error) {
        res.status(500).send({message: error.message})
        console.log(error)
    }
})



app.get("/get/:id", async (req, res) => {
    try{
        let result = await collection.findOne({
            "_id" : new ObjectId(req.params.id)
        })
        res.send(result)


    } catch(error) {
        res.status(500).send({message: error.message})
        console.log(error)
    }
})


    app.listen(process.env.PORT || PORT, () => {
        console.log('Server is running.')
    })