const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb')
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

require("dotenv").config()

const client = new MongoClient(process.env.FINAL_URL)

app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(express.json())

app.listen(3000);
console.log("app running at http://localhost:3000");

app.get("/testMongo", async (req, res) => {
    try {
        await client.connect();
        const colli = client.db("logintutorial").collection("user")
        const user = await colli.find({}).toArray();

        res.status(200).send(user);
    } catch (err) {
        console.log(err)
        res.status(500).send({
            err: "something went wrong",
            valu: err
        })
    } finally {
        await client.close();
    }
})

app.post("/register", async (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password) {
        res.status(401).send({
            status: "Bad Request",
            message: "some fields are missing"
        })
        return;
    }
    try {
        await client.connect();
        let newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            uuid: uuidv4()
        }
        const colli = client.db("logintutorial").collection("user")
        // const query = { email: newUser.email };
        // const user = await colli.findOne(query)
        // if (!user) {
        //     res.status(201).send({
        //         status: "Ok",
        //         message: "Bad request: this user already exists"
        //     })
        //     return;
        // }
        const insertedUser = await colli.insertOne(newUser)


        res.status(201).send({
            status: "Ok",
            message: "Account successfully created",
            data: insertedUser
        })
        // users.push(newUser)
    } catch (err) {
        res.status(500).send({
            status: "nop",
            message: "something went wrong",
        })
    } finally {
        await client.close();
    }
})
app.post("/login", async (req, res) => {

    if (!req.body.email || !req.body.password) {
        res.status(400).send({
            status: "Bad Request",
            message: "some fields are missing"
        })
        return;
    }
    try {
        await client.connect();
        let loginuser = {
            email: req.body.email,
            password: req.body.password
        }
        const colli = client.db("logintutorial").collection("user")

        const query = { email: loginuser.email };
        const user = await colli.findOne(query)

        if (user) {
            if (user.password == loginuser.password) {
                res.status(200).send({
                    status: "Authentication succesfull",
                    message: "you are logged in",
                    data: {
                        username: user.username,
                        email: user.email,
                        uuid: user.uuid
                    }
                })
            } else {
                res.status(400).send({
                    status: "Authentication error",
                    message: "password is incorrect"
                })
            }
        } else {
            res.status(400).send({
                status: "Authentication error",
                message: "No user with this email has found!"
            })
        }
    } catch (err) {
        res.status(500).send('something went wrong')
    } finally {
        await client.close();
    }
})
app.post("/verifyID", async (req, res) => {

    //Check for empty and faulty ID fields
    if (!req.body.uuid) {
        res.status(401).send({
            status: "Bad Request",
            message: "ID is missing"
        })
        return
    } else {
        if (!uuidValidate(req.body.uuid)) {
            res.status(401).send({
                status: "Bad Request",
                message: "ID is not a valid UUID"
            })
            return
        }
    }
    try {
        //connect to the db
        await client.connect();

        //retrieve the users collection data
        const colli = client.db('logintutorial').collection('user');

        const query = { uuid: req.body.uuid }
        const user = await colli.findOne(query)

        if (user) {
            res.status(200).send({
                status: "Verified",
                message: "Your UUID is valid.",
                data: {
                    username: user.username,
                    email: user.email,
                    uuid: user.uuid,
                }
            })
        } else {
            //Password is incorrect
            res.status(401).send({
                status: "Verify error",
                message: `No user exists with uuid ${req.body.uuid}`
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            error: 'Something went wrong!',
            value: error
        });
    } finally {
        await client.close();
    }

})
