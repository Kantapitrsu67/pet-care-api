const { sql } = require('@vercel/postgres');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 📍 ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
app.get('/pets', async (req, res) => {
    try {
        const { rows } = await sql`SELECT * FROM pets ORDER BY id DESC`;
        res.json(rows);
    } catch (e) { res.status(500).json(e); }
});

// 📍 เพิ่มสัตว์เลี้ยงใหม่
app.post('/pets', async (req, res) => {
    const { pet_name, breed, birth_date, weight, chip_id, avatar } = req.body;
    try {
        const result = await sql`
            INSERT INTO pets (pet_name, breed, birth_date, weight, chip_id, avatar) 
            VALUES (${pet_name}, ${breed}, ${birth_date}, ${weight}, ${chip_id}, ${avatar}) 
            RETURNING id`;
        res.json({ id: result.rows[0].id, message: "บันทึกสำเร็จ!" });
    } catch (e) { res.status(500).json(e); }
});

// 📍 ดึงรายละเอียด + ประวัติ (ใช้ในหน้า Detail)
app.get('/pets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pet = await sql`SELECT * FROM pets WHERE id = ${id}`;
        const vaccines = await sql`SELECT * FROM vaccines WHERE pet_id = ${id}`;
        const treatments = await sql`SELECT * FROM treatments WHERE pet_id = ${id}`;
        res.json({ info: pet.rows[0], vaccines: vaccines.rows, treatments: treatments.rows });
    } catch (e) { res.status(500).json(e); }
});

// 📍 เพิ่มประวัติวัคซีน
app.post('/vaccines', async (req, res) => {
    const { pet_id, vac_type, vac_name, lot_number, date_administered, clinic_name, next_due_date } = req.body;
    try {
        await sql`INSERT INTO vaccines (pet_id, vac_type, vac_name, lot_number, date_administered, clinic_name, next_due_date) 
                  VALUES (${pet_id}, ${vac_type}, ${vac_name}, ${lot_number}, ${date_administered}, ${clinic_name}, ${next_due_date})`;
        res.json({ message: "เพิ่มวัคซีนแล้ว" });
    } catch (e) { res.status(500).json(e); }
});

module.exports = app;