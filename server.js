const express = require("express")
const path = require("path")
const mysql = require("mysql2");
const { compose } = require("stream");

require("./cron");

let obj = new express();

obj.set("view engine", "ejs")

obj.use(express.static(path.join(__dirname, "static")));

const today = new Date();

obj.use(express.json());

obj.use(express.urlencoded({ extended: true }));
let connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

connection.connect((err) => {
    if (err) {
        console.log("error");
    }
    else {
        console.log("no error")
    }
})

obj.get("/", (req, res) => {

    const date = today.toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
    const day = today.toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata"
    })

    const sql="Select * from appointment";
    connection.query(sql,(err,result)=>{
        if(err)
        {
            
            res.render("index", { day, date});
            console.log(err);
        }
        else{
            
            res.render("index", { day, date,result});
            console.log("success");
        }
    })
    
})


obj.post("/saveData", (req, res) => {
    let name = req.body.name;
    let address = req.body.address;
    let phone1 = req.body.phone1;
    let dob = req.body.dob;
    let appointmentDate = req.body.appointment;
    let gender = req.body.gender;
    let treatment_type = req.body.TreatmentType;

    const sql = "insert into appointment (name,address,phone1, dob, appointmentDate, gender,treatment_type) values(?,?,?,?,?,?,?)";
    connection.query(sql, [name, address, phone1, dob, appointmentDate, gender,treatment_type], (err, result) => {
        if (err) {
            console.log(err)
           
            res.json({ msg: "fail"});
        }
        else {
             let data ={name:name,address:address,phone1:phone1,dob:dob,appointmentDate:appointmentDate,gender:gender,treatment_type:treatment_type};
            res.json({ msg: "success",newData:data });
        }
    })

})

obj.listen(3000, () => {
    console.log("Server run")
})