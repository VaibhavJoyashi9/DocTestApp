const cron = require("node-cron");
const mysql = require("mysql2");
const axios = require("axios");
require("dotenv").config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TEMPLATE_NAME = process.env.TEMPLATE_NAME;
const TEMPLATE_LANG = process.env.TEMPLATE_LANG;

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
connection.getConnection((err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
        return;
    }

    console.log("Database connected successfully");
});

function formatPhone(rawPhone) {
    if (!rawPhone) {
        throw new Error("Phone number is missing");
    }

    let phone = String(rawPhone)
        .trim()
        .replace(/\D/g, "");

    if (phone.startsWith("0")) {
        phone = phone.substring(1);
    }

    if (!phone.startsWith("91")) {
        phone = `91${phone}`;
    }

    if (phone.length !== 12) {
        throw new Error(`Invalid phone number: ${phone}`);
    }

    return phone;
}

async function sendWhatsAppMessage(patient) {
    const phone = formatPhone(patient.phone1);

    const requestBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
            name: TEMPLATE_NAME,
            language: {
                code: TEMPLATE_LANG
            },
            components: [
                {
                    type: "body",
                    parameters: [
                        {
                            type: "text",
                            text: patient.name || "Patient"
                        },
                        {
                            type: "text",
                            text: patient.treatment_type || "Checkup"
                        }
                    ]
                }
            ]
        }
    };

    console.log("------------------------------------");
    console.log("Patient:", patient.name);
    console.log("Phone:", phone);
    console.log("Treatment:", patient.treatment_type);

    const response = await axios.post(
        `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
        requestBody,
        {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            timeout: 30000
        }
    );

    console.log(
        "WhatsApp API response:",
        JSON.stringify(response.data, null, 2)
    );

    console.log(`Message accepted for ${patient.name}`);
}

function sendMsg() {
    console.log("\nRunning appointment reminder job...");
    console.log("Current time:", new Date().toLocaleString("en-IN"));

    const sql = `
        SELECT
            name,
            phone1,
            treatment_type,
            appointmentDate
        FROM appointment
        WHERE DATE(appointmentDate) =
              DATE_ADD(CURDATE(), INTERVAL 1 DAY)
    `;

    connection.query(sql, async (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return;
        }

        if (results.length === 0) {
            console.log("No appointments found for tomorrow");
            return;
        }

        for (const patient of results) {
            try {
                await sendWhatsAppMessage(patient);

                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Message failed for ${patient.name}`);

                if (error.response) {
                    console.error("HTTP status:", error.response.status);
                    console.error(
                        "Meta error:",
                        JSON.stringify(error.response.data, null, 2)
                    );
                } else {
                    console.error("Error:", error.message);
                }
            }
        }

        console.log("Reminder job completed");
    });
}

cron.schedule(
    "*/30 * * * * *",
    () => {
        sendMsg();
    },
    {
        timezone: "Asia/Kolkata"
    }
);

