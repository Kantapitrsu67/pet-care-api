const { sql } = require('@vercel/postgres');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. หน้าแรก (เอาไว้เช็คว่า Server รันอยู่)
app.get('/', (req, res) => {
  res.send('Pet Care API is running! 🚀');
});

// 2. ดึงข้อมูลสัตว์เลี้ยงทั้งหมด
app.get('/pets', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM pets ORDER BY id DESC`;
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. เพิ่มสัตว์เลี้ยงใหม่
app.post('/pets', async (req, res) => {
  const { pet_name, breed, birth_date, weight, chip_id, avatar } = req.body;
  try {
    const result = await sql`
      INSERT INTO pets (pet_name, breed, birth_date, weight, chip_id, avatar)
      VALUES (${pet_name}, ${breed}, ${birth_date}, ${weight}, ${chip_id}, ${avatar})
      RETURNING id`;
    res.json({ id: result.rows[0].id, message: "เพิ่มน้องสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ดึงข้อมูลรายละเอียดน้องตัวเดียว + ประวัติวัคซีน
app.get('/pets/:id', async (req, res) => {
  const petId = req.params.id;
  try {
    const pet = await sql`SELECT * FROM pets WHERE id = ${petId}`;
    const vaccines = await sql`SELECT * FROM vaccines WHERE pet_id = ${petId}`;
    res.json({
      info: pet.rows[0],
      vaccines: vaccines.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. เพิ่มประวัติวัคซีน
app.post('/vaccines', async (req, res) => {
  const { pet_id, vac_type, vac_name, lot_number, date_administered, clinic_name, next_due_date } = req.body;
  try {
    await sql`
      INSERT INTO vaccines (pet_id, vac_type, vac_name, lot_number, date_administered, clinic_name, next_due_date)
      VALUES (${pet_id}, ${vac_type}, ${vac_name}, ${lot_number}, ${date_administered}, ${clinic_name}, ${next_due_date})`;
    res.json({ message: "บันทึกวัคซีนเรียบร้อย!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📍 6. API: อัปเดตข้อมูลสัตว์เลี้ยง (แก้ Error 404)
app.put('/pets/update', async (req, res) => {
  const { id, pet_name, breed, birth_date, weight, chip_id, avatar } = req.body;
  try {
    await sql`
      UPDATE pets 
      SET pet_name = ${pet_name}, 
          breed = ${breed}, 
          birth_date = ${birth_date}, 
          weight = ${weight}, 
          chip_id = ${chip_id}, 
          avatar = ${avatar}
      WHERE id = ${id}`;
    res.json({ message: "อัปเดตข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📍 7. API: ลบข้อมูลสัตว์เลี้ยง (เผื่อเตงกดปุ่มลบหน้าแรก)
app.delete('/pets', async (req, res) => {
  const { id } = req.body;
  try {
    await sql`DELETE FROM pets WHERE id = ${id}`;
    res.json({ message: "ลบข้อมูลสำเร็จ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
